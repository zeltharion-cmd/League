import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "8090"))
BASE_DIR = Path(__file__).resolve().parent
PLATFORM_FIXED = "euw1"
LOCKED_GAME_NAME = "feelsbanman"
LOCKED_TAG_LINE = "EUW"
KARMA_CHAMPION_ID = 43
DISPLAY_MATCH_COUNT_FIXED = 5
KARMA_SETUP_MATCH_COUNT = 30
DEEPL0L_API_BASE = "https://b2c-api-cdn.deeplol.gg"
STATIC_CACHE_SECONDS = 6 * 60 * 60
DEEPL0L_CACHE_SECONDS = 5 * 60
HIGH_LEVEL_TARGETS = {
    "kp": 65.0,
    "deaths": 4.5,
    "vision_per_min": 1.8,
    "control_wards": 2.2,
    "assists_14": 6.0,
    "deaths_14": 1.0,
    "first_death_min": 9.0,
}
STATIC_REF_CACHE: dict[str, Any] = {
    "fetched_at": 0,
    "version": "",
    "item_names": {},
    "item_tags": {},
    "rune_names": {},
    "rune_icons": {},
    "spell_names": {},
    "spell_icons": {},
}
DEEPL0L_KARMA_CACHE: dict[str, Any] = {
    "fetched_at": 0,
    "otp_rows": [],
    "builds": {},
}

# Platform regions (game shard) to regional routing values for Match-v5/Account-v1.
PLATFORM_TO_ROUTING = {
    "na1": "americas",
    "br1": "americas",
    "la1": "americas",
    "la2": "americas",
    "euw1": "europe",
    "eun1": "europe",
    "tr1": "europe",
    "ru": "europe",
    "kr": "asia",
    "jp1": "asia",
    "oc1": "sea",
    "ph2": "sea",
    "sg2": "sea",
    "th2": "sea",
    "tw2": "sea",
    "vn2": "sea",
}

RIOT_HTTP_HEADERS = {
    "Accept": "application/json",
    # Riot/Cloudflare can block default urllib agents on some endpoints.
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://developer.riotgames.com/",
    "Origin": "https://developer.riotgames.com",
}


class RiotApiError(Exception):
    def __init__(self, status: int, endpoint: str, url: str, detail: str = "") -> None:
        super().__init__(f"Riot API error ({status}) on {endpoint}")
        self.status = status
        self.endpoint = endpoint
        self.url = url
        self.detail = detail


def json_response(handler: SimpleHTTPRequestHandler, status: HTTPStatus, payload: dict[str, Any]) -> None:
    raw = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(raw)))
    handler.end_headers()
    handler.wfile.write(raw)


def riot_get_json(url: str, api_key: str, endpoint: str) -> Any:
    headers = dict(RIOT_HTTP_HEADERS)
    headers["X-Riot-Token"] = api_key

    last_error: RiotApiError | None = None
    for attempt in range(2):
        request = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=12) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            try:
                detail = exc.read().decode("utf-8")
            except Exception:
                detail = ""
            last_error = RiotApiError(status=exc.code, endpoint=endpoint, url=url, detail=detail[:350])

            # One quick retry for transient edge blocks/rate transitions.
            if attempt == 0 and exc.code in {403, 429, 500, 502, 503, 504}:
                time.sleep(0.35)
                continue
            raise last_error from exc
        except urllib.error.URLError as exc:
            last_error = RiotApiError(status=502, endpoint=endpoint, url=url, detail=str(exc))
            if attempt == 0:
                time.sleep(0.25)
                continue
            raise last_error from exc

    if last_error:
        raise last_error
    raise RiotApiError(status=500, endpoint=endpoint, url=url, detail="Unknown request error")


def optional_riot_get_json(
    url: str,
    api_key: str,
    endpoint: str,
    fallback: Any,
    diagnostics: list[dict[str, Any]],
) -> Any:
    try:
        return riot_get_json(url, api_key, endpoint)
    except RiotApiError as exc:
        diagnostics.append(
            {
                "endpoint": endpoint,
                "status": exc.status,
                "detail": exc.detail[:180],
            }
        )
        return fallback


def safe_num(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def safe_int_text(value: str) -> int:
    try:
        return int(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return 0


def is_support_role(role: str) -> bool:
    role_upper = role.upper()
    return role_upper in {"UTILITY", "SUPPORT"}


def http_get_json(url: str, endpoint: str) -> Any:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": RIOT_HTTP_HEADERS["User-Agent"],
            "Accept-Language": RIOT_HTTP_HEADERS["Accept-Language"],
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=14) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = ""
        try:
            detail = exc.read().decode("utf-8")
        except Exception:
            detail = ""
        raise ValueError(f"{endpoint} failed ({exc.code}): {detail[:160]}") from exc
    except Exception as exc:
        raise ValueError(f"{endpoint} failed: {exc}") from exc


def get_static_reference_maps() -> tuple[
    str,
    dict[int, str],
    dict[int, list[str]],
    dict[int, str],
    dict[int, str],
    dict[int, str],
    dict[int, str],
]:
    now = int(time.time())
    if (
        safe_int_text(STATIC_REF_CACHE.get("fetched_at", 0)) > 0
        and (now - safe_int_text(STATIC_REF_CACHE.get("fetched_at", 0))) < STATIC_CACHE_SECONDS
        and isinstance(STATIC_REF_CACHE.get("item_names"), dict)
        and STATIC_REF_CACHE.get("item_names")
    ):
        return (
            str(STATIC_REF_CACHE.get("version", "")),
            STATIC_REF_CACHE["item_names"],
            STATIC_REF_CACHE["item_tags"],
            STATIC_REF_CACHE["rune_names"],
            STATIC_REF_CACHE["rune_icons"],
            STATIC_REF_CACHE["spell_names"],
            STATIC_REF_CACHE["spell_icons"],
        )

    version_list = http_get_json("https://ddragon.leagueoflegends.com/api/versions.json", "ddragon_versions")
    if not isinstance(version_list, list) or not version_list:
        raise ValueError("Could not load Data Dragon versions.")
    version = str(version_list[0])

    item_data = http_get_json(
        f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/item.json",
        "ddragon_items",
    )
    rune_data = http_get_json(
        f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/runesReforged.json",
        "ddragon_runes",
    )
    spell_data = http_get_json(
        f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/summoner.json",
        "ddragon_spells",
    )

    item_names: dict[int, str] = {}
    item_tags: dict[int, list[str]] = {}
    for item_id_str, item in (item_data.get("data", {}) or {}).items():
        item_id = safe_num(item_id_str)
        if item_id <= 0:
            continue
        item_names[item_id] = str(item.get("name", f"Item {item_id}"))
        tags = item.get("tags")
        item_tags[item_id] = [str(tag) for tag in tags] if isinstance(tags, list) else []

    rune_names: dict[int, str] = {
        5001: "Health Scaling",
        5002: "Armor",
        5003: "Magic Resist",
        5005: "Attack Speed",
        5007: "Ability Haste",
        5008: "Adaptive Force",
        5010: "Move Speed",
        5011: "Health",
    }
    rune_icons: dict[int, str] = {}
    if isinstance(rune_data, list):
        for tree in rune_data:
            tree_id = safe_num(tree.get("id"))
            if tree_id > 0:
                rune_names[tree_id] = str(tree.get("name", f"Rune {tree_id}"))
            for slot in tree.get("slots", []) or []:
                for rune in slot.get("runes", []) or []:
                    rune_id = safe_num(rune.get("id"))
                    if rune_id > 0:
                        rune_names[rune_id] = str(rune.get("name", f"Rune {rune_id}"))
                        icon_path = str(rune.get("icon", "")).strip()
                        if icon_path:
                            rune_icons[rune_id] = f"https://ddragon.leagueoflegends.com/cdn/img/{icon_path}"

    spell_names: dict[int, str] = {}
    spell_icons: dict[int, str] = {}
    for spell in (spell_data.get("data", {}) or {}).values():
        spell_id = safe_num(spell.get("key"))
        if spell_id > 0:
            spell_names[spell_id] = str(spell.get("name", f"Spell {spell_id}"))
            image_full = str((spell.get("image", {}) or {}).get("full", "")).strip()
            if image_full:
                spell_icons[spell_id] = (
                    f"https://ddragon.leagueoflegends.com/cdn/{version}/img/spell/{image_full}"
                )

    STATIC_REF_CACHE["fetched_at"] = now
    STATIC_REF_CACHE["version"] = version
    STATIC_REF_CACHE["item_names"] = item_names
    STATIC_REF_CACHE["item_tags"] = item_tags
    STATIC_REF_CACHE["rune_names"] = rune_names
    STATIC_REF_CACHE["rune_icons"] = rune_icons
    STATIC_REF_CACHE["spell_names"] = spell_names
    STATIC_REF_CACHE["spell_icons"] = spell_icons
    return (
        version,
        item_names,
        item_tags,
        rune_names,
        rune_icons,
        spell_names,
        spell_icons,
    )


def deeplol_get_json(endpoint: str, params: dict[str, str]) -> Any:
    query = urllib.parse.urlencode(params)
    url = f"{DEEPL0L_API_BASE}/{endpoint}?{query}"
    return http_get_json(url, f"deeplol_{endpoint}")


def select_best_build_detail(data_rows: list[dict[str, Any]]) -> dict[str, Any]:
    all_build_details: list[dict[str, Any]] = []
    for row in data_rows:
        for build_row in row.get("data_list", []) or []:
            details = build_row.get("build_detail", [])
            if isinstance(details, list):
                for detail in details:
                    if isinstance(detail, dict):
                        all_build_details.append(detail)

    viable = [
        d for d in all_build_details
        if safe_num(d.get("core_item")) > 0 and safe_num(d.get("rune_main")) > 0
    ]
    detail_pool = viable if viable else all_build_details
    if not detail_pool:
        raise ValueError("Deeplol build detail list was empty.")
    detail_pool.sort(
        key=lambda d: (
            safe_num(d.get("games")),
            float(d.get("win_rate", 0.0) or 0.0),
        ),
        reverse=True,
    )
    return detail_pool[0]


def get_karma_otp_rows_from_deeplol(limit: int = 12) -> list[dict[str, Any]]:
    now = int(time.time())
    cache_ts = safe_int_text(DEEPL0L_KARMA_CACHE.get("fetched_at", 0))
    cache_rows = DEEPL0L_KARMA_CACHE.get("otp_rows", [])
    if (
        cache_ts > 0
        and (now - cache_ts) < DEEPL0L_CACHE_SECONDS
        and isinstance(cache_rows, list)
        and cache_rows
    ):
        return cache_rows[:limit]

    rank_payload = deeplol_get_json(
        "champion/mastery_rank",
        {
            "platform_id": "KR",
            "lane": "All",
            "champion_id": str(KARMA_CHAMPION_ID),
            "cnt": "30",
        },
    )
    data_list = rank_payload.get("data_list", []) if isinstance(rank_payload, dict) else []
    if not isinstance(data_list, list) or not data_list:
        raise ValueError("Deeplol mastery_rank returned no Karma data.")

    support_rows = [
        row for row in data_list
        if str(row.get("lane", "")).lower().startswith("support")
    ]
    candidates = support_rows if support_rows else data_list
    candidates.sort(
        key=lambda row: (
            safe_num(row.get("rank")),
            -safe_num(row.get("lp")),
            -safe_num(row.get("games")),
        )
    )
    if not candidates:
        raise ValueError("No OTP candidates found for Karma.")

    DEEPL0L_KARMA_CACHE["fetched_at"] = now
    DEEPL0L_KARMA_CACHE["otp_rows"] = candidates
    DEEPL0L_KARMA_CACHE["builds"] = {}
    return candidates[:limit]


def get_otp_build_from_deeplol(puu_id: str) -> dict[str, Any]:
    puu = str(puu_id).strip()
    if not puu:
        raise ValueError("Missing OTP puu_id.")

    builds_cache = DEEPL0L_KARMA_CACHE.get("builds", {})
    if isinstance(builds_cache, dict):
        cached = builds_cache.get(puu)
        if isinstance(cached, dict) and cached:
            return cached

    build_payload = deeplol_get_json(
        "champion/master_build",
        {
            "puu_id": puu,
            "platform_id": "KR",
        },
    )
    data_rows = build_payload.get("data", []) if isinstance(build_payload, dict) else []
    if not isinstance(data_rows, list) or not data_rows:
        raise ValueError("Deeplol master_build returned no rows.")

    best_build = select_best_build_detail(data_rows)
    if not isinstance(DEEPL0L_KARMA_CACHE.get("builds"), dict):
        DEEPL0L_KARMA_CACHE["builds"] = {}
    DEEPL0L_KARMA_CACHE["builds"][puu] = best_build
    return best_build


def is_support_quest_item(item_id: int) -> bool:
    return item_id in {
        3850, 3851, 3853, 3854, 3855, 3857,
        3862, 3863, 3864,
        3869, 3870, 3871, 3876, 3877,
    }


def top_ids(counter: Counter[int], limit: int, predicate: Any = None) -> list[int]:
    rows = []
    for key, count in counter.items():
        if key <= 0:
            continue
        if predicate and not predicate(key):
            continue
        rows.append((key, count))
    rows.sort(key=lambda row: (-row[1], row[0]))
    return [row[0] for row in rows[:limit]]


def id_name(value: int, mapping: dict[int, str], prefix: str) -> str:
    value_num = safe_num(value)
    if value_num <= 0:
        return "-"
    return mapping.get(value_num, f"{prefix} {value_num}")


def ids_to_names(values: list[int], mapping: dict[int, str], prefix: str) -> list[str]:
    names: list[str] = []
    for value in values:
        value_num = safe_num(value)
        if value_num <= 0:
            continue
        names.append(mapping.get(value_num, f"{prefix} {value_num}"))
    return names


def build_item_details(item_ids: list[int], item_names: dict[int, str], version: str) -> list[dict[str, Any]]:
    details: list[dict[str, Any]] = []
    for item_id in item_ids:
        item_num = safe_num(item_id)
        if item_num <= 0:
            continue
        details.append(
            {
                "id": item_num,
                "name": item_names.get(item_num, f"Item {item_num}"),
                "icon": f"https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{item_num}.png",
            }
        )
    return details


def build_spell_details(
    spell_ids: list[int],
    spell_names: dict[int, str],
    spell_icons: dict[int, str],
) -> list[dict[str, Any]]:
    details: list[dict[str, Any]] = []
    for spell_id in spell_ids:
        spell_num = safe_num(spell_id)
        if spell_num <= 0:
            continue
        details.append(
            {
                "id": spell_num,
                "name": spell_names.get(spell_num, f"Spell {spell_num}"),
                "icon": spell_icons.get(spell_num, ""),
            }
        )
    return details


def build_rune_details(
    rune_ids: list[int],
    rune_names: dict[int, str],
    rune_icons: dict[int, str],
) -> list[dict[str, Any]]:
    details: list[dict[str, Any]] = []
    for rune_id in rune_ids:
        rune_num = safe_num(rune_id)
        if rune_num <= 0:
            continue
        details.append(
            {
                "id": rune_num,
                "name": rune_names.get(rune_num, f"Rune {rune_num}"),
                "icon": rune_icons.get(rune_num, ""),
            }
        )
    return details


def best_deeplol_combo(items: list[dict[str, Any]]) -> list[int]:
    if not isinstance(items, list) or not items:
        return []
    ranked = sorted(
        [row for row in items if isinstance(row, dict)],
        key=lambda row: (safe_num(row.get("games")), float(row.get("win_rate", 0.0) or 0.0)),
        reverse=True,
    )
    if not ranked:
        return []
    values = ranked[0].get("items", [])
    if not isinstance(values, list):
        return []
    return [safe_num(v) for v in values if safe_num(v) > 0]


def average(values: list[float]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def weighted_average(pairs: list[tuple[float, float]]) -> float:
    total_weight = sum(max(weight, 0.0) for _, weight in pairs)
    if total_weight <= 0:
        return 0.0
    return sum(value * max(weight, 0.0) for value, weight in pairs) / total_weight


def frame_at_or_before(frames: list[dict[str, Any]], target_ms: int) -> dict[str, Any] | None:
    chosen = None
    chosen_ts = -1
    for frame in frames:
        frame_ts = safe_num(frame.get("timestamp"))
        if frame_ts <= target_ms and frame_ts > chosen_ts:
            chosen = frame
            chosen_ts = frame_ts
    return chosen


def top_k_from_counter(counter: Counter[int], k: int) -> list[int]:
    return [item for item, _ in counter.most_common(k) if safe_num(item) > 0]


def build_top5_otp_benchmark(
    otp_rows: list[dict[str, Any]],
    *,
    version: str,
    item_names: dict[int, str],
    rune_names: dict[int, str],
    rune_icons: dict[int, str],
    spell_names: dict[int, str],
    spell_icons: dict[int, str],
) -> dict[str, Any]:
    top_rows = otp_rows[:5]
    if not top_rows:
        return {}

    core_counter: Counter[int] = Counter()
    boots_counter: Counter[int] = Counter()
    keystone_counter: Counter[int] = Counter()
    primary_style_counter: Counter[int] = Counter()
    secondary_style_counter: Counter[int] = Counter()
    primary_rune_counter: Counter[int] = Counter()
    secondary_rune_counter: Counter[int] = Counter()
    shard_counter: Counter[int] = Counter()
    spell_counter: Counter[int] = Counter()

    wr_pairs: list[tuple[float, float]] = []
    kda_pairs: list[tuple[float, float]] = []
    lp_values: list[float] = []
    games_values: list[float] = []
    profile_rows: list[dict[str, Any]] = []

    for row in top_rows:
        puu_id = str(row.get("puu_id", "")).strip()
        games_weight = float(max(safe_num(row.get("games")), 1))
        wr_pairs.append((float(row.get("win_rate", 0.0) or 0.0) * 100, games_weight))
        kda_pairs.append((float(row.get("kda", 0.0) or 0.0), games_weight))
        lp_values.append(float(safe_num(row.get("lp"))))
        games_values.append(float(safe_num(row.get("games"))))
        profile_rows.append(
            {
                "riotId": f"{row.get('riot_id_name', 'Unknown')}#{row.get('riot_id_tag_line', '?')}",
                "rank": safe_num(row.get("rank")),
                "tier": row.get("tier"),
                "lp": safe_num(row.get("lp")),
                "games": safe_num(row.get("games")),
                "winRate": round(float(row.get("win_rate", 0.0) or 0.0) * 100, 1),
                "kda": round(float(row.get("kda", 0.0) or 0.0), 2),
            }
        )

        if not puu_id:
            continue
        try:
            build = get_otp_build_from_deeplol(puu_id)
        except Exception:
            continue

        otp_rune = build.get("rune", {}) if isinstance(build.get("rune"), dict) else {}
        otp_rune_main = [safe_num(v) for v in (otp_rune.get("rune_main", []) or []) if safe_num(v) > 0]
        otp_rune_sub = [safe_num(v) for v in (otp_rune.get("rune_sub", []) or []) if safe_num(v) > 0]
        otp_rune_stat = [safe_num(v) for v in (otp_rune.get("rune_stat", []) or []) if safe_num(v) > 0]

        otp_core = best_deeplol_combo(build.get("item_build_3", []))
        if len(otp_core) < 3:
            otp_core = best_deeplol_combo(build.get("item_build_2", []))
        if not otp_core and safe_num(build.get("core_item")) > 0:
            otp_core = [safe_num(build.get("core_item"))]
        otp_boots = safe_num((build.get("boots", [{}]) or [{}])[0].get("boots", 0))
        otp_spells = (build.get("spell", [{}]) or [{}])[0].get("spell", [])
        otp_spell_ids = [safe_num(v) for v in otp_spells if safe_num(v) > 0]

        for item_id in otp_core:
            core_counter[item_id] += games_weight
        if otp_boots > 0:
            boots_counter[otp_boots] += games_weight
        for spell_id in otp_spell_ids:
            spell_counter[spell_id] += games_weight

        if otp_rune_main:
            primary_style_counter[otp_rune_main[0]] += games_weight
        if len(otp_rune_main) > 1:
            keystone_counter[otp_rune_main[1]] += games_weight
            for rune_id in otp_rune_main[2:]:
                primary_rune_counter[rune_id] += games_weight
        if otp_rune_sub:
            secondary_style_counter[otp_rune_sub[0]] += games_weight
            for rune_id in otp_rune_sub[1:]:
                secondary_rune_counter[rune_id] += games_weight
        for shard_id in otp_rune_stat:
            shard_counter[shard_id] += games_weight

    top_core_ids = top_k_from_counter(core_counter, 3)
    top_boot_id = top_k_from_counter(boots_counter, 1)
    top_spell_ids = top_k_from_counter(spell_counter, 2)
    top_primary_style_id = top_k_from_counter(primary_style_counter, 1)
    top_keystone_id = top_k_from_counter(keystone_counter, 1)
    top_secondary_style_id = top_k_from_counter(secondary_style_counter, 1)
    top_primary_rune_ids = top_k_from_counter(primary_rune_counter, 3)
    top_secondary_rune_ids = top_k_from_counter(secondary_rune_counter, 2)
    top_shard_ids = top_k_from_counter(shard_counter, 3)

    return {
        "profiles": profile_rows,
        "averages": {
            "winRate": round(weighted_average(wr_pairs), 1),
            "kda": round(weighted_average(kda_pairs), 2),
            "lp": round(average(lp_values), 0),
            "games": round(average(games_values), 1),
        },
        "build": {
            "coreItemIds": top_core_ids,
            "coreItems": ids_to_names(top_core_ids, item_names, "Item"),
            "coreItemsDetailed": build_item_details(top_core_ids, item_names, version),
            "bootsId": top_boot_id[0] if top_boot_id else 0,
            "boots": id_name(top_boot_id[0], item_names, "Item") if top_boot_id else "-",
            "bootsDetailed": build_item_details(top_boot_id, item_names, version),
            "summonerSpellIds": top_spell_ids,
            "summonerSpells": ids_to_names(top_spell_ids, spell_names, "Spell"),
            "summonerSpellsDetailed": build_spell_details(top_spell_ids, spell_names, spell_icons),
        },
        "runes": {
            "primaryStyleId": top_primary_style_id[0] if top_primary_style_id else 0,
            "primaryStyle": id_name(top_primary_style_id[0], rune_names, "Rune") if top_primary_style_id else "-",
            "keystoneId": top_keystone_id[0] if top_keystone_id else 0,
            "keystone": id_name(top_keystone_id[0], rune_names, "Rune") if top_keystone_id else "-",
            "keystoneDetailed": build_rune_details(top_keystone_id, rune_names, rune_icons),
            "primaryRuneIds": top_primary_rune_ids,
            "primaryRunes": ids_to_names(top_primary_rune_ids, rune_names, "Rune"),
            "primaryRunesDetailed": build_rune_details(top_primary_rune_ids, rune_names, rune_icons),
            "secondaryStyleId": top_secondary_style_id[0] if top_secondary_style_id else 0,
            "secondaryStyle": id_name(top_secondary_style_id[0], rune_names, "Rune") if top_secondary_style_id else "-",
            "secondaryRuneIds": top_secondary_rune_ids,
            "secondaryRunes": ids_to_names(top_secondary_rune_ids, rune_names, "Rune"),
            "secondaryRunesDetailed": build_rune_details(top_secondary_rune_ids, rune_names, rune_icons),
            "statShardIds": top_shard_ids,
            "statShards": ids_to_names(top_shard_ids, rune_names, "Rune"),
            "statShardsDetailed": build_rune_details(top_shard_ids, rune_names, rune_icons),
        },
    }


def karma_otp_comparison_from_deeplol(
    *,
    karma_games: int,
    karma_wins: int,
    selected_otp_puu_id: str,
    karma_item_counter: Counter[int],
    karma_keystone_counter: Counter[int],
    karma_primary_style_counter: Counter[int],
    karma_secondary_style_counter: Counter[int],
    karma_secondary_keystone_counter: Counter[int],
    karma_spell_counter: Counter[tuple[int, int]],
    diagnostics: list[dict[str, Any]],
) -> dict[str, Any]:
    try:
        (
            ddragon_version,
            item_names,
            item_tags,
            rune_names,
            rune_icons,
            spell_names,
            spell_icons,
        ) = get_static_reference_maps()
        otp_rows = get_karma_otp_rows_from_deeplol(limit=12)
        selected_row = next(
            (
                row for row in otp_rows
                if str(row.get("puu_id", "")).strip() == selected_otp_puu_id
            ),
            None,
        )
        otp_row = selected_row if isinstance(selected_row, dict) else otp_rows[0]
        otp_puu_id = str(otp_row.get("puu_id", "")).strip()
        otp_build = get_otp_build_from_deeplol(otp_puu_id)
        top5_benchmark = build_top5_otp_benchmark(
            otp_rows,
            version=ddragon_version,
            item_names=item_names,
            rune_names=rune_names,
            rune_icons=rune_icons,
            spell_names=spell_names,
            spell_icons=spell_icons,
        )
    except Exception as exc:
        diagnostics.append(
            {
                "endpoint": "deeplol_otp_compare",
                "status": 0,
                "detail": str(exc)[:180],
            }
        )
        return {
            "source": "deeplol.gg",
            "region": "KR",
            "error": "Failed to load Deeplol OTP benchmark.",
            "detail": str(exc)[:200],
        }

    otp_rune = otp_build.get("rune", {}) if isinstance(otp_build.get("rune"), dict) else {}
    otp_rune_main = [safe_num(v) for v in (otp_rune.get("rune_main", []) or []) if safe_num(v) > 0]
    otp_rune_sub = [safe_num(v) for v in (otp_rune.get("rune_sub", []) or []) if safe_num(v) > 0]
    otp_rune_stat = [safe_num(v) for v in (otp_rune.get("rune_stat", []) or []) if safe_num(v) > 0]

    otp_boots = safe_num((otp_build.get("boots", [{}]) or [{}])[0].get("boots", 0))
    otp_spells = (otp_build.get("spell", [{}]) or [{}])[0].get("spell", [])
    otp_spell_ids = [safe_num(v) for v in otp_spells if safe_num(v) > 0]

    otp_core = best_deeplol_combo(otp_build.get("item_build_3", []))
    if len(otp_core) < 3:
        otp_core = best_deeplol_combo(otp_build.get("item_build_2", []))
    if not otp_core and safe_num(otp_build.get("core_item")) > 0:
        otp_core = [safe_num(otp_build.get("core_item"))]

    boot_ids = {
        item_id for item_id, tags in item_tags.items()
        if isinstance(tags, list) and "Boots" in tags
    }
    trinket_ids = {
        item_id for item_id, tags in item_tags.items()
        if isinstance(tags, list) and "Trinket" in tags
    }

    your_boots = top_ids(karma_item_counter, 1, lambda item_id: item_id in boot_ids)
    your_core = top_ids(
        karma_item_counter,
        3,
        lambda item_id: (
            item_id not in boot_ids
            and item_id not in trinket_ids
            and not is_support_quest_item(item_id)
            and item_id != 2055
        ),
    )
    if not your_core:
        your_core = top_ids(
            karma_item_counter,
            3,
            lambda item_id: item_id not in trinket_ids and item_id not in boot_ids,
        )

    your_keystone = top_ids(karma_keystone_counter, 1)[0] if karma_keystone_counter else 0
    your_primary_style = top_ids(karma_primary_style_counter, 1)[0] if karma_primary_style_counter else 0
    your_secondary_style = top_ids(karma_secondary_style_counter, 1)[0] if karma_secondary_style_counter else 0
    your_secondary_rune = top_ids(karma_secondary_keystone_counter, 1)[0] if karma_secondary_keystone_counter else 0
    spell_pair_values = sorted(karma_spell_counter.items(), key=lambda row: (-row[1], row[0]))
    your_spell_ids: list[int] = []
    if spell_pair_values:
        your_spell_ids = [safe_num(spell_pair_values[0][0][0]), safe_num(spell_pair_values[0][0][1])]

    otp_primary_style = otp_rune_main[0] if len(otp_rune_main) > 0 else 0
    otp_keystone = otp_rune_main[1] if len(otp_rune_main) > 1 else 0
    otp_secondary_style = otp_rune_sub[0] if len(otp_rune_sub) > 0 else 0

    missing_core = [item for item in otp_core if item not in your_core]
    extra_core = [item for item in your_core if item not in otp_core]
    shared_core = [item for item in your_core if item in otp_core]

    advice: list[str] = []
    if missing_core:
        advice.append(f"Prioritize OTP core items: {', '.join(ids_to_names(missing_core, item_names, 'Item'))}.")
    if otp_keystone and your_keystone and otp_keystone != your_keystone:
        advice.append(
            f"Switch keystone from {id_name(your_keystone, rune_names, 'Rune')} "
            f"to {id_name(otp_keystone, rune_names, 'Rune')} for OTP alignment."
        )
    if otp_secondary_style and your_secondary_style and otp_secondary_style != your_secondary_style:
        advice.append(
            f"Match secondary tree to {id_name(otp_secondary_style, rune_names, 'Rune')}."
        )
    if otp_boots and your_boots and otp_boots != your_boots[0]:
        advice.append(
            f"Boot preference mismatch: OTP uses {id_name(otp_boots, item_names, 'Item')}."
        )
    if not advice:
        advice.append("Your Karma setup is already close to the KR OTP benchmark.")

    otp_options = [
        {
            "puuId": str(row.get("puu_id", "")).strip(),
            "riotId": f"{row.get('riot_id_name', 'Unknown')}#{row.get('riot_id_tag_line', '?')}",
            "rank": safe_num(row.get("rank")),
            "tier": row.get("tier"),
            "lp": safe_num(row.get("lp")),
            "games": safe_num(row.get("games")),
            "winRate": round(float(row.get("win_rate", 0.0) or 0.0) * 100, 1),
        }
        for row in otp_rows
    ]

    return {
        "source": "deeplol.gg",
        "region": "KR",
        "champion": "Karma",
        "ddragonVersion": ddragon_version,
        "selectedOtpPuuId": otp_puu_id,
        "otpOptions": otp_options,
        "top5Benchmark": top5_benchmark,
        "otp": {
            "riotId": f"{otp_row.get('riot_id_name', 'Unknown')}#{otp_row.get('riot_id_tag_line', '?')}",
            "rank": safe_num(otp_row.get("rank")),
            "tier": otp_row.get("tier"),
            "lp": safe_num(otp_row.get("lp")),
            "games": safe_num(otp_row.get("games")),
            "winRate": round(float(otp_row.get("win_rate", 0.0) or 0.0) * 100, 1),
            "kda": round(float(otp_row.get("kda", 0.0) or 0.0), 2),
            "lane": otp_row.get("lane"),
            "coreItemIds": otp_core,
            "coreItems": ids_to_names(otp_core, item_names, "Item"),
            "coreItemsDetailed": build_item_details(otp_core, item_names, ddragon_version),
            "bootsId": otp_boots,
            "boots": id_name(otp_boots, item_names, "Item"),
            "bootsDetailed": build_item_details([otp_boots], item_names, ddragon_version),
            "summonerSpellIds": otp_spell_ids,
            "summonerSpells": ids_to_names(otp_spell_ids, spell_names, "Spell"),
            "summonerSpellsDetailed": build_spell_details(otp_spell_ids, spell_names, spell_icons),
            "runes": {
                "primaryStyleId": otp_primary_style,
                "primaryStyle": id_name(otp_primary_style, rune_names, "Rune"),
                "keystoneId": otp_keystone,
                "keystone": id_name(otp_keystone, rune_names, "Rune"),
                "keystoneDetailed": build_rune_details([otp_keystone], rune_names, rune_icons),
                "primaryRuneIds": otp_rune_main[1:],
                "primaryRunes": ids_to_names(otp_rune_main[1:], rune_names, "Rune"),
                "primaryRunesDetailed": build_rune_details(otp_rune_main[1:], rune_names, rune_icons),
                "secondaryStyleId": otp_secondary_style,
                "secondaryStyle": id_name(otp_secondary_style, rune_names, "Rune"),
                "secondaryRuneIds": otp_rune_sub[1:],
                "secondaryRunes": ids_to_names(otp_rune_sub[1:], rune_names, "Rune"),
                "secondaryRunesDetailed": build_rune_details(otp_rune_sub[1:], rune_names, rune_icons),
                "statShardIds": otp_rune_stat,
                "statShards": ids_to_names(otp_rune_stat, rune_names, "Rune"),
                "statShardsDetailed": build_rune_details(otp_rune_stat, rune_names, rune_icons),
            },
        },
        "you": {
            "karmaGames": karma_games,
            "karmaWinRate": round((karma_wins * 100 / karma_games), 1) if karma_games else 0.0,
            "coreItemIds": your_core,
            "coreItems": ids_to_names(your_core, item_names, "Item"),
            "coreItemsDetailed": build_item_details(your_core, item_names, ddragon_version),
            "bootsId": your_boots[0] if your_boots else 0,
            "boots": id_name(your_boots[0], item_names, "Item") if your_boots else "-",
            "bootsDetailed": build_item_details([your_boots[0]], item_names, ddragon_version) if your_boots else [],
            "summonerSpellIds": your_spell_ids,
            "summonerSpells": ids_to_names(your_spell_ids, spell_names, "Spell"),
            "summonerSpellsDetailed": build_spell_details(your_spell_ids, spell_names, spell_icons),
            "runes": {
                "primaryStyleId": your_primary_style,
                "primaryStyle": id_name(your_primary_style, rune_names, "Rune"),
                "keystoneId": your_keystone,
                "keystone": id_name(your_keystone, rune_names, "Rune"),
                "keystoneDetailed": build_rune_details([your_keystone], rune_names, rune_icons),
                "secondaryStyleId": your_secondary_style,
                "secondaryStyle": id_name(your_secondary_style, rune_names, "Rune"),
                "secondaryRuneId": your_secondary_rune,
                "secondaryRune": id_name(your_secondary_rune, rune_names, "Rune"),
                "secondaryRuneDetailed": build_rune_details([your_secondary_rune], rune_names, rune_icons),
            },
        },
        "comparison": {
            "sharedCoreItemIds": shared_core,
            "sharedCoreItems": ids_to_names(shared_core, item_names, "Item"),
            "missingFromYourCoreIds": missing_core,
            "missingFromYourCore": ids_to_names(missing_core, item_names, "Item"),
            "extraInYourCoreIds": extra_core,
            "extraInYourCore": ids_to_names(extra_core, item_names, "Item"),
            "keystoneMatch": bool(otp_keystone and your_keystone and otp_keystone == your_keystone),
            "primaryTreeMatch": bool(otp_primary_style and your_primary_style and otp_primary_style == your_primary_style),
            "secondaryTreeMatch": bool(
                otp_secondary_style and your_secondary_style and otp_secondary_style == your_secondary_style
            ),
            "advice": advice,
        },
    }


def player_summary(
    game_name: str,
    tag_line: str,
    platform: str,
    match_count: int,
    api_key: str,
    selected_otp_puu_id: str,
    debug_mode: bool = False,
) -> dict[str, Any]:
    routing = PLATFORM_TO_ROUTING.get(platform)
    if not routing:
        raise ValueError("Unsupported platform region")
    diagnostics: list[dict[str, Any]] = []

    encoded_game_name = urllib.parse.quote(game_name, safe="")
    encoded_tag_line = urllib.parse.quote(tag_line, safe="")

    account_url = (
        f"https://{routing}.api.riotgames.com/riot/account/v1/accounts"
        f"/by-riot-id/{encoded_game_name}/{encoded_tag_line}"
    )
    account: dict[str, Any]
    summoner: dict[str, Any]
    puuid: str

    try:
        account = riot_get_json(account_url, api_key, "account_by_riot_id")
        puuid = str(account.get("puuid", "")).strip()
        if not puuid:
            raise ValueError("Riot account response did not include puuid.")
        summoner_url = (
            f"https://{platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        )
        summoner = riot_get_json(summoner_url, api_key, "summoner_by_puuid")
    except RiotApiError as primary_error:
        diagnostics.append(
            {
                "endpoint": primary_error.endpoint,
                "status": primary_error.status,
                "detail": "Riot ID lookup failed",
            }
        )
        raise primary_error

    match_ids_count = max(match_count, KARMA_SETUP_MATCH_COUNT)
    match_ids_url = (
        f"https://{routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
        f"?start=0&count={match_ids_count}"
    )
    match_ids = optional_riot_get_json(
        match_ids_url,
        api_key,
        "match_ids",
        fallback=[],
        diagnostics=diagnostics,
    )

    recent_matches: list[dict[str, Any]] = []
    wins = 0
    total_kills = 0
    total_deaths = 0
    total_assists = 0
    total_cs = 0
    support_games = 0
    total_vision = 0
    total_control_wards = 0
    total_wards_cleared = 0
    total_kp = 0.0
    total_ally_utility = 0
    total_cc_score = 0
    role_counts: dict[str, int] = {}
    karma_games = 0
    karma_wins = 0
    karma_item_counter: Counter[int] = Counter()
    karma_keystone_counter: Counter[int] = Counter()
    karma_primary_style_counter: Counter[int] = Counter()
    karma_secondary_style_counter: Counter[int] = Counter()
    karma_secondary_keystone_counter: Counter[int] = Counter()
    karma_spell_counter: Counter[tuple[int, int]] = Counter()
    karma_kills_sum = 0
    karma_deaths_sum = 0
    karma_assists_sum = 0
    karma_kp_sum = 0.0
    karma_vision_per_min_sum = 0.0
    karma_control_wards_sum = 0
    karma_assists_14_sum = 0
    karma_deaths_14_sum = 0
    karma_first_death_min_sum = 0.0
    karma_first_death_samples = 0
    karma_gold_diff_14_sum = 0
    karma_xp_diff_14_sum = 0
    karma_lane_samples = 0
    karma_trend: list[dict[str, Any]] = []
    matchup_stats: dict[str, dict[str, Any]] = {}

    for match_id in match_ids:
        match_url = f"https://{routing}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        match = optional_riot_get_json(
            match_url,
            api_key,
            "match_detail",
            fallback={},
            diagnostics=diagnostics,
        )
        if not isinstance(match, dict) or "info" not in match:
            continue
        participants = match.get("info", {}).get("participants", [])
        participant = next((p for p in participants if p.get("puuid") == puuid), None)
        if not participant:
            continue

        champion_id = safe_num(participant.get("championId"))
        kills = safe_num(participant.get("kills"))
        deaths = safe_num(participant.get("deaths"))
        assists = safe_num(participant.get("assists"))
        cs = safe_num(participant.get("totalMinionsKilled")) + safe_num(participant.get("neutralMinionsKilled"))
        win = bool(participant.get("win"))
        role = str(
            participant.get("teamPosition")
            or participant.get("individualPosition")
            or "UNKNOWN"
        ).upper()
        should_include_in_display = len(recent_matches) < match_count
        if should_include_in_display:
            role_counts[role] = role_counts.get(role, 0) + 1

        team_id = participant.get("teamId")
        team_kills = sum(
            safe_num(p.get("kills"))
            for p in participants
            if p.get("teamId") == team_id
        )
        kill_participation = round(((kills + assists) * 100 / team_kills), 1) if team_kills > 0 else 0.0

        vision_score = safe_num(participant.get("visionScore"))
        control_wards = safe_num(
            participant.get("detectorWardsPlaced")
            or participant.get("visionWardsBoughtInGame")
        )
        wards_cleared = safe_num(participant.get("wardsKilled"))
        ally_utility = (
            safe_num(participant.get("totalHealsOnTeammates"))
            + safe_num(participant.get("totalDamageShieldedOnTeammates"))
        )
        cc_score = safe_num(participant.get("timeCCingOthers"))

        if champion_id == KARMA_CHAMPION_ID or str(participant.get("championName", "")).lower() == "karma":
            karma_games += 1
            karma_wins += 1 if win else 0
            karma_kills_sum += kills
            karma_deaths_sum += deaths
            karma_assists_sum += assists
            karma_kp_sum += kill_participation
            duration_minutes = max(round(safe_num(match.get("info", {}).get("gameDuration")) / 60, 1), 0.1)
            karma_vision_per_min_sum += vision_score / duration_minutes
            karma_control_wards_sum += control_wards

            for slot in ("item0", "item1", "item2", "item3", "item4", "item5", "item6"):
                item_id = safe_num(participant.get(slot))
                if item_id > 0:
                    karma_item_counter[item_id] += 1

            perks = participant.get("perks", {})
            styles = perks.get("styles", []) if isinstance(perks, dict) else []
            if isinstance(styles, list) and styles:
                primary = styles[0] if isinstance(styles[0], dict) else {}
                primary_style = safe_num(primary.get("style"))
                if primary_style > 0:
                    karma_primary_style_counter[primary_style] += 1
                primary_selections = primary.get("selections", []) if isinstance(primary, dict) else []
                if isinstance(primary_selections, list) and primary_selections:
                    keystone = safe_num((primary_selections[0] or {}).get("perk"))
                    if keystone > 0:
                        karma_keystone_counter[keystone] += 1

            if isinstance(styles, list) and len(styles) > 1:
                secondary = styles[1] if isinstance(styles[1], dict) else {}
                secondary_style = safe_num(secondary.get("style"))
                if secondary_style > 0:
                    karma_secondary_style_counter[secondary_style] += 1
                secondary_selections = secondary.get("selections", []) if isinstance(secondary, dict) else []
                if isinstance(secondary_selections, list) and secondary_selections:
                    secondary_rune = safe_num((secondary_selections[0] or {}).get("perk"))
                    if secondary_rune > 0:
                        karma_secondary_keystone_counter[secondary_rune] += 1

            summoner1 = safe_num(participant.get("summoner1Id"))
            summoner2 = safe_num(participant.get("summoner2Id"))
            if summoner1 > 0 and summoner2 > 0:
                karma_spell_counter[(summoner1, summoner2)] += 1

            enemy_team_id = 200 if safe_num(participant.get("teamId")) == 100 else 100
            enemy_support = next(
                (
                    p for p in participants
                    if safe_num(p.get("teamId")) == enemy_team_id
                    and str(p.get("teamPosition", "")).upper() in {"UTILITY", "SUPPORT"}
                ),
                None,
            )
            enemy_bot = next(
                (
                    p for p in participants
                    if safe_num(p.get("teamId")) == enemy_team_id
                    and str(p.get("teamPosition", "")).upper() in {"BOTTOM", "BOT"}
                ),
                None,
            )
            enemy_support_name = (enemy_support or {}).get("championName", "Unknown")
            enemy_bot_name = (enemy_bot or {}).get("championName", "Unknown")
            matchup_key = f"{enemy_support_name}|{enemy_bot_name}"
            if matchup_key not in matchup_stats:
                matchup_stats[matchup_key] = {
                    "enemySupport": enemy_support_name,
                    "enemyBot": enemy_bot_name,
                    "games": 0,
                    "wins": 0,
                    "kpSum": 0.0,
                    "deathsSum": 0,
                    "visionPerMinSum": 0.0,
                }
            matchup_stats[matchup_key]["games"] += 1
            matchup_stats[matchup_key]["wins"] += 1 if win else 0
            matchup_stats[matchup_key]["kpSum"] += kill_participation
            matchup_stats[matchup_key]["deathsSum"] += deaths
            matchup_stats[matchup_key]["visionPerMinSum"] += vision_score / duration_minutes

            assists_14 = 0
            deaths_14 = 0
            first_death_min = 0.0
            gold_diff_14 = 0
            xp_diff_14 = 0
            timeline_url = f"https://{routing}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"
            timeline = optional_riot_get_json(
                timeline_url,
                api_key,
                "match_timeline",
                fallback={},
                diagnostics=diagnostics,
            )
            if isinstance(timeline, dict):
                timeline_info = timeline.get("info", {})
                frames = timeline_info.get("frames", []) if isinstance(timeline_info, dict) else []
                participant_id = safe_num(participant.get("participantId"))
                enemy_support_id = safe_num((enemy_support or {}).get("participantId"))

                for frame in frames:
                    frame_ts = safe_num(frame.get("timestamp"))
                    if frame_ts > 14 * 60 * 1000:
                        continue
                    events = frame.get("events", [])
                    if not isinstance(events, list):
                        continue
                    for event in events:
                        if event.get("type") != "CHAMPION_KILL":
                            continue
                        if safe_num(event.get("victimId")) == participant_id:
                            deaths_14 += 1
                            if first_death_min <= 0:
                                first_death_min = round(safe_num(event.get("timestamp")) / 60000, 1)
                        assisting = event.get("assistingParticipantIds", [])
                        if isinstance(assisting, list) and participant_id in [safe_num(x) for x in assisting]:
                            assists_14 += 1

                frame_14 = frame_at_or_before(frames, 14 * 60 * 1000)
                if frame_14 and participant_id > 0 and enemy_support_id > 0:
                    pframes = frame_14.get("participantFrames", {})
                    my_frame = pframes.get(str(participant_id), {}) if isinstance(pframes, dict) else {}
                    opp_frame = pframes.get(str(enemy_support_id), {}) if isinstance(pframes, dict) else {}
                    if isinstance(my_frame, dict) and isinstance(opp_frame, dict):
                        gold_diff_14 = safe_num(my_frame.get("totalGold")) - safe_num(opp_frame.get("totalGold"))
                        xp_diff_14 = safe_num(my_frame.get("xp")) - safe_num(opp_frame.get("xp"))
                        karma_gold_diff_14_sum += gold_diff_14
                        karma_xp_diff_14_sum += xp_diff_14
                        karma_lane_samples += 1

            karma_assists_14_sum += assists_14
            karma_deaths_14_sum += deaths_14
            if first_death_min > 0:
                karma_first_death_min_sum += first_death_min
                karma_first_death_samples += 1

            karma_trend.append(
                {
                    "matchId": match_id,
                    "result": "Win" if win else "Loss",
                    "timestamp": safe_num(match.get("info", {}).get("gameEndTimestamp")),
                    "deaths": deaths,
                    "killParticipation": round(kill_participation, 1),
                    "visionPerMin": round(vision_score / duration_minutes, 2),
                    "controlWards": control_wards,
                    "assists14": assists_14,
                    "deaths14": deaths_14,
                    "firstDeathMin": first_death_min,
                    "goldDiff14": gold_diff_14,
                    "xpDiff14": xp_diff_14,
                }
            )

        if should_include_in_display:
            total_kills += kills
            total_deaths += deaths
            total_assists += assists
            total_cs += cs
            wins += 1 if win else 0
            if is_support_role(role):
                support_games += 1
                total_vision += vision_score
                total_control_wards += control_wards
                total_wards_cleared += wards_cleared
                total_kp += kill_participation
                total_ally_utility += ally_utility
                total_cc_score += cc_score

            recent_matches.append(
                {
                    "matchId": match_id,
                    "championId": champion_id,
                    "champion": participant.get("championName", "Unknown"),
                    "queue": match.get("info", {}).get("queueId"),
                    "result": "Win" if win else "Loss",
                    "kills": kills,
                    "deaths": deaths,
                    "assists": assists,
                    "cs": cs,
                    "gold": safe_num(participant.get("goldEarned")),
                    "durationMin": round(safe_num(match.get("info", {}).get("gameDuration")) / 60, 1),
                    "role": role,
                    "killParticipation": kill_participation,
                    "visionScore": vision_score,
                    "controlWards": control_wards,
                    "wardsCleared": wards_cleared,
                    "allyUtility": ally_utility,
                    "ccScore": cc_score,
                }
            )

    games_played = len(recent_matches)
    avg_kda = (
        (total_kills + total_assists) / max(total_deaths, 1)
        if games_played
        else 0.0
    )
    win_rate = (wins * 100 / games_played) if games_played else 0.0

    primary_role = max(role_counts, key=role_counts.get) if role_counts else "UNKNOWN"
    matchup_breakdown = sorted(
        [
            {
                "enemySupport": row["enemySupport"],
                "enemyBot": row["enemyBot"],
                "games": row["games"],
                "winRate": round((row["wins"] * 100 / row["games"]), 1) if row["games"] else 0.0,
                "avgKillParticipation": round((row["kpSum"] / row["games"]), 1) if row["games"] else 0.0,
                "avgDeaths": round((row["deathsSum"] / row["games"]), 2) if row["games"] else 0.0,
                "avgVisionPerMin": round((row["visionPerMinSum"] / row["games"]), 2) if row["games"] else 0.0,
            }
            for row in matchup_stats.values()
        ],
        key=lambda x: x["games"],
        reverse=True,
    )[:10]

    karma_comparison = karma_otp_comparison_from_deeplol(
        karma_games=karma_games,
        karma_wins=karma_wins,
        selected_otp_puu_id=selected_otp_puu_id,
        karma_item_counter=karma_item_counter,
        karma_keystone_counter=karma_keystone_counter,
        karma_primary_style_counter=karma_primary_style_counter,
        karma_secondary_style_counter=karma_secondary_style_counter,
        karma_secondary_keystone_counter=karma_secondary_keystone_counter,
        karma_spell_counter=karma_spell_counter,
        diagnostics=diagnostics,
    )

    karma_win_rate = round((karma_wins * 100 / karma_games), 1) if karma_games else 0.0
    karma_kda = round(((karma_kills_sum + karma_assists_sum) / max(karma_deaths_sum, 1)), 2) if karma_games else 0.0
    karma_deaths_pg = round((karma_deaths_sum / karma_games), 2) if karma_games else 0.0
    karma_kp = round((karma_kp_sum / karma_games), 1) if karma_games else 0.0
    karma_vpm = round((karma_vision_per_min_sum / karma_games), 2) if karma_games else 0.0
    karma_ctrl_pg = round((karma_control_wards_sum / karma_games), 2) if karma_games else 0.0
    assists_14_pg = round((karma_assists_14_sum / karma_games), 2) if karma_games else 0.0
    deaths_14_pg = round((karma_deaths_14_sum / karma_games), 2) if karma_games else 0.0
    first_death_avg = round((karma_first_death_min_sum / karma_first_death_samples), 2) if karma_first_death_samples else 0.0
    gold_diff_14 = round((karma_gold_diff_14_sum / karma_lane_samples), 1) if karma_lane_samples else 0.0
    xp_diff_14 = round((karma_xp_diff_14_sum / karma_lane_samples), 1) if karma_lane_samples else 0.0

    benchmark = karma_comparison.get("top5Benchmark", {})
    benchmark_avg = benchmark.get("averages", {}) if isinstance(benchmark, dict) else {}
    delta_vs_top5 = {
        "winRate": round(karma_win_rate - float(benchmark_avg.get("winRate", 0.0) or 0.0), 1),
        "kda": round(karma_kda - float(benchmark_avg.get("kda", 0.0) or 0.0), 2),
    }
    delta_vs_targets = {
        "killParticipation": round(karma_kp - HIGH_LEVEL_TARGETS["kp"], 1),
        "deathsPerGame": round(karma_deaths_pg - HIGH_LEVEL_TARGETS["deaths"], 2),
        "visionPerMin": round(karma_vpm - HIGH_LEVEL_TARGETS["vision_per_min"], 2),
        "controlWardsPerGame": round(karma_ctrl_pg - HIGH_LEVEL_TARGETS["control_wards"], 2),
        "assistsBefore14": round(assists_14_pg - HIGH_LEVEL_TARGETS["assists_14"], 2),
        "deathsBefore14": round(deaths_14_pg - HIGH_LEVEL_TARGETS["deaths_14"], 2),
        "firstDeathMin": round(first_death_avg - HIGH_LEVEL_TARGETS["first_death_min"], 2),
    }

    deficit_rows = [
        ("Kill Participation", max(0.0, (HIGH_LEVEL_TARGETS["kp"] - karma_kp) / max(HIGH_LEVEL_TARGETS["kp"], 1.0)), 20),
        ("Deaths per game", max(0.0, (karma_deaths_pg - HIGH_LEVEL_TARGETS["deaths"]) / max(HIGH_LEVEL_TARGETS["deaths"], 1.0)), 25),
        ("Vision per minute", max(0.0, (HIGH_LEVEL_TARGETS["vision_per_min"] - karma_vpm) / max(HIGH_LEVEL_TARGETS["vision_per_min"], 1.0)), 20),
        ("Control wards per game", max(0.0, (HIGH_LEVEL_TARGETS["control_wards"] - karma_ctrl_pg) / max(HIGH_LEVEL_TARGETS["control_wards"], 1.0)), 15),
        ("Assists before 14", max(0.0, (HIGH_LEVEL_TARGETS["assists_14"] - assists_14_pg) / max(HIGH_LEVEL_TARGETS["assists_14"], 1.0)), 10),
        ("Deaths before 14", max(0.0, (deaths_14_pg - HIGH_LEVEL_TARGETS["deaths_14"]) / max(HIGH_LEVEL_TARGETS["deaths_14"], 1.0)), 10),
    ]
    penalty = sum(min(deficit, 1.5) * weight for _, deficit, weight in deficit_rows)
    improvement_score = max(0, round(100 - penalty))
    if improvement_score >= 85:
        improvement_grade = "A"
    elif improvement_score >= 70:
        improvement_grade = "B"
    elif improvement_score >= 55:
        improvement_grade = "C"
    else:
        improvement_grade = "D"
    focus_targets = [
        f"Improve {name}: current gap {round(deficit * 100, 1)}% vs target."
        for name, deficit, _ in sorted(deficit_rows, key=lambda row: row[1], reverse=True)
        if deficit > 0
    ][:3]

    payload: dict[str, Any] = {
        "player": {
            "gameName": account.get("gameName"),
            "tagLine": account.get("tagLine"),
            "profileIconId": summoner.get("profileIconId"),
            "summonerLevel": summoner.get("summonerLevel"),
            "puuid": puuid,
        },
        "recentMatches": recent_matches,
        "aggregate": {
            "games": games_played,
            "wins": wins,
            "losses": max(games_played - wins, 0),
            "winRate": round(win_rate, 1),
            "avgKda": round(avg_kda, 2),
            "avgCs": round((total_cs / games_played), 1) if games_played else 0.0,
            "avgKills": round((total_kills / games_played), 1) if games_played else 0.0,
            "avgDeaths": round((total_deaths / games_played), 1) if games_played else 0.0,
            "avgAssists": round((total_assists / games_played), 1) if games_played else 0.0,
        },
        "supportInsights": {
            "primaryRole": primary_role,
            "supportGames": support_games,
            "supportRate": round((support_games * 100 / games_played), 1) if games_played else 0.0,
            "avgVisionScore": round((total_vision / support_games), 1) if support_games else 0.0,
            "avgControlWards": round((total_control_wards / support_games), 1) if support_games else 0.0,
            "avgWardsCleared": round((total_wards_cleared / support_games), 1) if support_games else 0.0,
            "avgKillParticipation": round((total_kp / support_games), 1) if support_games else 0.0,
            "avgAllyUtility": round((total_ally_utility / support_games), 0) if support_games else 0.0,
            "avgCcScore": round((total_cc_score / support_games), 1) if support_games else 0.0,
        },
        "karmaOtpComparison": karma_comparison,
        "karmaInsights": {
            "sampleMatches": KARMA_SETUP_MATCH_COUNT,
            "analyzedKarmaGames": karma_games,
            "your": {
                "winRate": karma_win_rate,
                "kda": karma_kda,
                "deathsPerGame": karma_deaths_pg,
                "killParticipation": karma_kp,
                "visionPerMin": karma_vpm,
                "controlWardsPerGame": karma_ctrl_pg,
                "assistsBefore14": assists_14_pg,
                "deathsBefore14": deaths_14_pg,
                "firstDeathMin": first_death_avg,
                "goldDiff14": gold_diff_14,
                "xpDiff14": xp_diff_14,
            },
            "top5OtpAverages": benchmark_avg,
            "targetBands": HIGH_LEVEL_TARGETS,
            "deltaVsTop5": delta_vs_top5,
            "deltaVsTargets": delta_vs_targets,
            "trend": karma_trend,
            "lanePhase": {
                "samples": karma_lane_samples,
                "avgGoldDiff14": gold_diff_14,
                "avgXpDiff14": xp_diff_14,
                "avgAssistsBefore14": assists_14_pg,
                "avgDeathsBefore14": deaths_14_pg,
                "avgFirstDeathMin": first_death_avg,
            },
            "matchups": matchup_breakdown,
            "improvementScore": {
                "score": improvement_score,
                "grade": improvement_grade,
                "focusTargets": focus_targets,
            },
        },
    }
    if debug_mode:
        payload["diagnostics"] = diagnostics
    return payload


class LoLTrackerHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/stats":
            return super().do_GET()

        api_key = os.environ.get("RIOT_API_KEY", "").strip()
        if not api_key:
            return json_response(
                self,
                HTTPStatus.BAD_REQUEST,
                {"error": "Missing RIOT_API_KEY environment variable."},
            )

        query = urllib.parse.parse_qs(parsed.query)
        # This tracker is intentionally hard-locked to one account.
        game_name = LOCKED_GAME_NAME
        tag_line = LOCKED_TAG_LINE
        platform = query.get("platform", [PLATFORM_FIXED])[0].strip().lower()
        selected_otp_puu_id = query.get("otp_puu_id", [""])[0].strip()
        debug_mode = query.get("debug", ["0"])[0].strip() == "1"

        if platform != PLATFORM_FIXED:
            return json_response(
                self,
                HTTPStatus.BAD_REQUEST,
                {"error": "This tracker is locked to EUW1 only."},
            )

        if platform not in PLATFORM_TO_ROUTING:
            return json_response(
                self,
                HTTPStatus.BAD_REQUEST,
                {"error": "Unsupported platform. Example: na1, euw1, kr, oc1."},
            )

        matches = DISPLAY_MATCH_COUNT_FIXED

        try:
            payload = player_summary(
                game_name=game_name,
                tag_line=tag_line,
                platform=platform,
                match_count=matches,
                api_key=api_key,
                selected_otp_puu_id=selected_otp_puu_id,
                debug_mode=debug_mode,
            )
            return json_response(self, HTTPStatus.OK, payload)
        except RiotApiError as exc:
            return json_response(
                self,
                HTTPStatus.BAD_GATEWAY,
                {
                    "error": f"Riot API error ({exc.status}) on {exc.endpoint}.",
                    "endpoint": exc.endpoint,
                    "detail": exc.detail[:250],
                    "hint": (
                        "Your Riot key may be expired or missing access for this endpoint. "
                        "Generate a fresh key at developer.riotgames.com, set RIOT_API_KEY, "
                        "restart the server, and test /riot/account/v1/by-riot-id first."
                        if exc.status in {401, 403}
                        else ""
                    ),
                },
            )
        except urllib.error.URLError:
            return json_response(
                self,
                HTTPStatus.BAD_GATEWAY,
                {"error": "Network error contacting Riot API."},
            )
        except Exception as exc:
            return json_response(
                self,
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"error": "Unexpected server error.", "detail": str(exc)},
            )


def run() -> None:
    os.chdir(BASE_DIR)
    server = ThreadingHTTPServer((HOST, PORT), LoLTrackerHandler)
    print(f"LoL tracker running on http://{HOST}:{PORT}")
    print("Set RIOT_API_KEY before launching to enable live stats.")
    server.serve_forever()


if __name__ == "__main__":
    run()
