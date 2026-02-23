const searchFormEl = document.getElementById("searchForm");
const searchBtnEl = document.getElementById("searchBtn");
const statusTextEl = document.getElementById("statusText");
const dashboardEl = document.getElementById("dashboard");
const otpStatusEl = document.getElementById("otpStatus");
const otpProfileEl = document.getElementById("otpProfile");
const otpBuildEl = document.getElementById("otpBuild");
const yourBuildEl = document.getElementById("yourBuild");
const otpBuildIconsEl = document.getElementById("otpBuildIcons");
const yourBuildIconsEl = document.getElementById("yourBuildIcons");
const otpRunesBtnEl = document.getElementById("otpRunesBtn");
const yourRunesBtnEl = document.getElementById("yourRunesBtn");
const otpAdviceEl = document.getElementById("otpAdvice");
const otpSelectEl = document.getElementById("otpSelect");
const runesModalEl = document.getElementById("runesModal");
const closeRunesModalEl = document.getElementById("closeRunesModal");
const runesTitleEl = document.getElementById("runesTitle");
const runesBodyEl = document.getElementById("runesBody");
const benchmarkMetaEl = document.getElementById("benchmarkMeta");
const benchmarkBuildIconsEl = document.getElementById("benchmarkBuildIcons");
const deltaBadgesEl = document.getElementById("deltaBadges");
const improvementScoreEl = document.getElementById("improvementScore");
const focusTargetsEl = document.getElementById("focusTargets");
const trendChartEl = document.getElementById("trendChart");
const laneStatsEl = document.getElementById("laneStats");
const matchupBodyEl = document.getElementById("matchupBody");

const playerHeadingEl = document.getElementById("playerHeading");
const profileMetaEl = document.getElementById("profileMeta");
const gamesMetricEl = document.getElementById("gamesMetric");
const winRateMetricEl = document.getElementById("winRateMetric");
const kdaMetricEl = document.getElementById("kdaMetric");
const csMetricEl = document.getElementById("csMetric");
const supportRoleMetricEl = document.getElementById("supportRoleMetric");
const supportRateMetricEl = document.getElementById("supportRateMetric");
const supportVisionMetricEl = document.getElementById("supportVisionMetric");
const supportControlMetricEl = document.getElementById("supportControlMetric");
const supportKpMetricEl = document.getElementById("supportKpMetric");
const supportUtilityMetricEl = document.getElementById("supportUtilityMetric");
const matchesBodyEl = document.getElementById("matchesBody");

let selectedOtpPuuId = "";
let otpRunesCache = {};
let yourRunesCache = {};

function setStatus(message) {
  statusTextEl.textContent = message;
}

function setOtpStatus(message) {
  otpStatusEl.textContent = message;
}

function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function line(label, value) {
  return `<div><strong>${label}:</strong> ${value}</div>`;
}

function renderIconChip(item) {
  if (!item || !item.icon) {
    return "";
  }
  return (
    `<div class="icon-chip" title="${item.name || ""}">` +
    `<img src="${item.icon}" alt="${item.name || ""}" loading="lazy">` +
    `<span>${item.name || ""}</span>` +
    "</div>"
  );
}

function renderIconRow(items) {
  if (!Array.isArray(items) || !items.length) {
    return "<div class='stack-text'>No build images available.</div>";
  }
  return items.map((item) => renderIconChip(item)).join("");
}

function runeSection(title, entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const content = safeEntries.length
    ? safeEntries
      .map((entry) => {
        const icon = entry.icon ? `<img src="${entry.icon}" alt="${entry.name || ""}" loading="lazy">` : "";
        return `<div class="rune-chip">${icon}<span>${entry.name || "-"}</span></div>`;
      })
      .join("")
    : "<div class='stack-text'>No rune data.</div>";
  return (
    `<section class="rune-section">` +
    `<h4>${title}</h4>` +
    `<div class="rune-grid">${content}</div>` +
    "</section>"
  );
}

function deltaBadge(label, value, inverse = false, suffix = "") {
  const numeric = safeNum(value);
  const positive = inverse ? numeric <= 0 : numeric >= 0;
  const cls = positive ? "delta-good" : "delta-bad";
  const sign = numeric > 0 ? "+" : "";
  return `<span class="delta-badge ${cls}">${label}: ${sign}${numeric.toFixed(1)}${suffix}</span>`;
}

function renderTrendChart(trend) {
  const rows = Array.isArray(trend) ? [...trend].reverse() : [];
  if (!rows.length) {
    trendChartEl.innerHTML = "<div class='stack-text'>No trend data yet.</div>";
    return;
  }

  const width = 920;
  const height = 210;
  const pad = 24;
  const values = rows.map((r) => safeNum(r.killParticipation));
  const minV = Math.min(...values, 40);
  const maxV = Math.max(...values, 80);
  const range = Math.max(maxV - minV, 1);
  const points = rows.map((row, idx) => {
    const x = pad + (idx * (width - pad * 2)) / Math.max(rows.length - 1, 1);
    const y = height - pad - ((safeNum(row.killParticipation) - minV) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  trendChartEl.innerHTML =
    `<svg viewBox="0 0 ${width} ${height}" class="trend-svg" preserveAspectRatio="none">` +
    `<line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="axis" />` +
    `<line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" class="axis" />` +
    `<polyline points="${points}" class="trend-line" />` +
    `</svg>` +
    `<div class="trend-caption">Kill Participation trend (latest 30 sampled Karma games)</div>`;
}

function openRunesModal(type) {
  const isOtp = type === "otp";
  const runes = isOtp ? otpRunesCache : yourRunesCache;
  runesTitleEl.textContent = isOtp ? "OTP Rune Page" : "Your Rune Page";
  runesBodyEl.innerHTML =
    runeSection("Primary", runes.primary || []) +
    runeSection("Secondary", runes.secondary || []) +
    runeSection("Shards", runes.shards || []);
  runesModalEl.classList.remove("hidden");
}

function otpLabel(option) {
  const riotId = option.riotId || "Unknown#?";
  const rank = `#${safeNum(option.rank)}`;
  const tier = option.tier || "-";
  const lp = `${safeNum(option.lp)} LP`;
  return `${rank} ${riotId} (${tier} ${lp})`;
}

function renderOtpSelect(data) {
  const options = Array.isArray(data.otpOptions) ? data.otpOptions : [];
  if (!options.length) {
    otpSelectEl.innerHTML = `<option value="">No OTP options</option>`;
    otpSelectEl.disabled = true;
    return;
  }

  const selected = data.selectedOtpPuuId || selectedOtpPuuId || options[0].puuId;
  selectedOtpPuuId = selected;
  otpSelectEl.innerHTML = options
    .map((option) => {
      const value = option.puuId || "";
      const selectedAttr = value === selected ? " selected" : "";
      return `<option value="${value}"${selectedAttr}>${otpLabel(option)}</option>`;
    })
    .join("");
  otpSelectEl.disabled = false;
}

function renderDashboard(payload) {
  const player = payload.player || {};
  const aggregate = payload.aggregate || {};
  const support = payload.supportInsights || {};
  const matches = Array.isArray(payload.recentMatches) ? payload.recentMatches : [];

  playerHeadingEl.textContent = `${player.gameName || "feelsbanman"} #${player.tagLine || "EUW"}`;
  profileMetaEl.innerHTML =
    `<div>Region: <strong>EUW1</strong></div>` +
    `<div>Summoner Level: <strong>${safeNum(player.summonerLevel)}</strong></div>` +
    `<div>Profile Icon ID: <strong>${safeNum(player.profileIconId)}</strong></div>`;

  gamesMetricEl.textContent = safeNum(aggregate.games);
  winRateMetricEl.textContent = `${safeNum(aggregate.winRate).toFixed(1)}%`;
  kdaMetricEl.textContent = safeNum(aggregate.avgKda).toFixed(2);
  csMetricEl.textContent = safeNum(aggregate.avgCs).toFixed(1);
  supportRoleMetricEl.textContent = String(support.primaryRole || "UNKNOWN").replace("UTILITY", "SUPPORT");
  supportRateMetricEl.textContent = `${safeNum(support.supportRate).toFixed(1)}%`;
  supportVisionMetricEl.textContent = safeNum(support.avgVisionScore).toFixed(1);
  supportControlMetricEl.textContent = safeNum(support.avgControlWards).toFixed(1);
  supportKpMetricEl.textContent = `${safeNum(support.avgKillParticipation).toFixed(1)}%`;
  supportUtilityMetricEl.textContent = safeNum(support.avgAllyUtility).toLocaleString();

  if (!matches.length) {
    matchesBodyEl.innerHTML = `<tr><td colspan="12">No recent matches found.</td></tr>`;
  } else {
    matchesBodyEl.innerHTML = matches
      .map((match) => {
        const win = match.result === "Win";
        const role = String(match.role || "UNKNOWN").replace("UTILITY", "SUPPORT");
        return (
          "<tr>" +
          `<td>${match.champion || "Unknown"}</td>` +
          `<td>${role}</td>` +
          `<td><span class="pill ${win ? "win" : "loss"}">${win ? "Win" : "Loss"}</span></td>` +
          `<td>${safeNum(match.kills)} / ${safeNum(match.deaths)} / ${safeNum(match.assists)}</td>` +
          `<td>${safeNum(match.killParticipation).toFixed(1)}%</td>` +
          `<td>${safeNum(match.visionScore)}</td>` +
          `<td>${safeNum(match.controlWards)}</td>` +
          `<td>${safeNum(match.wardsCleared)}</td>` +
          `<td>${safeNum(match.allyUtility).toLocaleString()}</td>` +
          `<td>${safeNum(match.cs)}</td>` +
          `<td>${safeNum(match.gold).toLocaleString()}</td>` +
          `<td>${safeNum(match.durationMin).toFixed(1)}m</td>` +
          "</tr>"
        );
      })
      .join("");
  }

  dashboardEl.classList.remove("hidden");
}

function renderOtpComparison(payload) {
  const data = payload.karmaOtpComparison || {};
  renderOtpSelect(data);

  if (data.error) {
    otpProfileEl.innerHTML = line("Status", data.error);
    otpBuildEl.innerHTML = line("Detail", data.detail || "No detail");
    otpBuildIconsEl.innerHTML = "";
    yourBuildEl.innerHTML = line("Your Karma games", "-");
    yourBuildIconsEl.innerHTML = "";
    otpAdviceEl.innerHTML = "<li>Retry after refresh.</li>";
    otpRunesCache = {};
    yourRunesCache = {};
    setOtpStatus(data.error);
    return;
  }

  const otp = data.otp || {};
  const you = data.you || {};
  const comparison = data.comparison || {};
  const otpRunes = otp.runes || {};
  const yourRunes = you.runes || {};
  const otpCore = Array.isArray(otp.coreItems) ? otp.coreItems.join(" -> ") : "-";
  const yourCore = Array.isArray(you.coreItems) ? you.coreItems.join(" -> ") : "-";
  const otpSpells = Array.isArray(otp.summonerSpells) ? otp.summonerSpells.join(" + ") : "-";
  const yourSpells = Array.isArray(you.summonerSpells) ? you.summonerSpells.join(" + ") : "-";

  const otpBuildItems = [
    ...(Array.isArray(otp.coreItemsDetailed) ? otp.coreItemsDetailed : []),
    ...(Array.isArray(otp.bootsDetailed) ? otp.bootsDetailed : []),
    ...(Array.isArray(otp.summonerSpellsDetailed) ? otp.summonerSpellsDetailed : []),
  ];
  const yourBuildItems = [
    ...(Array.isArray(you.coreItemsDetailed) ? you.coreItemsDetailed : []),
    ...(Array.isArray(you.bootsDetailed) ? you.bootsDetailed : []),
    ...(Array.isArray(you.summonerSpellsDetailed) ? you.summonerSpellsDetailed : []),
  ];

  otpProfileEl.innerHTML =
    line("Riot ID", otp.riotId || "-") +
    line("Rank", `#${safeNum(otp.rank)} - ${otp.tier || "-"} ${safeNum(otp.lp)} LP`) +
    line("Karma WR/KDA", `${safeNum(otp.winRate).toFixed(1)}% / ${safeNum(otp.kda).toFixed(2)}`) +
    line("Games", safeNum(otp.games));

  otpBuildEl.innerHTML =
    line("Core Build", otpCore || "-") +
    line("Boots", otp.boots || "-") +
    line("Spells", otpSpells || "-") +
    line("Keystone", otpRunes.keystone || "-") +
    line("Primary Tree", otpRunes.primaryStyle || "-") +
    line("Secondary Tree", otpRunes.secondaryStyle || "-");
  otpBuildIconsEl.innerHTML = renderIconRow(otpBuildItems);

  yourBuildEl.innerHTML =
    line("Karma Sample", `${safeNum(you.karmaGames)} games (${safeNum(you.karmaWinRate).toFixed(1)}% WR)`) +
    line("Core Build", yourCore || "-") +
    line("Boots", you.boots || "-") +
    line("Spells", yourSpells || "-") +
    line("Keystone", yourRunes.keystone || "-") +
    line("Primary Tree", yourRunes.primaryStyle || "-") +
    line("Secondary Tree", yourRunes.secondaryStyle || "-");
  yourBuildIconsEl.innerHTML = renderIconRow(yourBuildItems);

  otpRunesCache = {
    primary: [
      ...(Array.isArray(otpRunes.keystoneDetailed) ? otpRunes.keystoneDetailed : []),
      ...(Array.isArray(otpRunes.primaryRunesDetailed) ? otpRunes.primaryRunesDetailed : []),
    ],
    secondary: Array.isArray(otpRunes.secondaryRunesDetailed) ? otpRunes.secondaryRunesDetailed : [],
    shards: Array.isArray(otpRunes.statShardsDetailed) ? otpRunes.statShardsDetailed : [],
  };
  yourRunesCache = {
    primary: Array.isArray(yourRunes.keystoneDetailed) ? yourRunes.keystoneDetailed : [],
    secondary: Array.isArray(yourRunes.secondaryRuneDetailed) ? yourRunes.secondaryRuneDetailed : [],
    shards: [],
  };

  const advice = Array.isArray(comparison.advice) ? comparison.advice : [];
  otpAdviceEl.innerHTML = advice.length
    ? advice.map((entry) => `<li>${entry}</li>`).join("")
    : "<li>No specific adjustments needed.</li>";

  setOtpStatus(`Loaded OTP: ${otp.riotId || "Unknown"} (KR).`);
}

function renderKarmaInsights(payload) {
  const insights = payload.karmaInsights || {};
  const benchmark = payload.karmaOtpComparison?.top5Benchmark || {};
  const benchmarkAverages = benchmark.averages || {};
  const benchmarkBuild = benchmark.build || {};
  const benchmarkRunes = benchmark.runes || {};
  const deltasTop5 = insights.deltaVsTop5 || {};
  const deltasTargets = insights.deltaVsTargets || {};
  const lane = insights.lanePhase || {};
  const score = insights.improvementScore || {};
  const matchups = Array.isArray(insights.matchups) ? insights.matchups : [];
  const focus = Array.isArray(score.focusTargets) ? score.focusTargets : [];

  benchmarkMetaEl.innerHTML =
    line("Top5 Avg WR", `${safeNum(benchmarkAverages.winRate).toFixed(1)}%`) +
    line("Top5 Avg KDA", safeNum(benchmarkAverages.kda).toFixed(2)) +
    line("Top5 Keystone", benchmarkRunes.keystone || "-") +
    line("Top5 Secondary", benchmarkRunes.secondaryStyle || "-");

  const benchmarkIcons = [
    ...(Array.isArray(benchmarkBuild.coreItemsDetailed) ? benchmarkBuild.coreItemsDetailed : []),
    ...(Array.isArray(benchmarkBuild.bootsDetailed) ? benchmarkBuild.bootsDetailed : []),
    ...(Array.isArray(benchmarkBuild.summonerSpellsDetailed) ? benchmarkBuild.summonerSpellsDetailed : []),
  ];
  benchmarkBuildIconsEl.innerHTML = renderIconRow(benchmarkIcons);

  deltaBadgesEl.innerHTML =
    deltaBadge("WR vs Top5", safeNum(deltasTop5.winRate), false, "%") +
    deltaBadge("KDA vs Top5", safeNum(deltasTop5.kda), false, "") +
    deltaBadge("KP vs Target", safeNum(deltasTargets.killParticipation), false, "%") +
    deltaBadge("Deaths vs Target", safeNum(deltasTargets.deathsPerGame), true, "") +
    deltaBadge("Vision/min vs Target", safeNum(deltasTargets.visionPerMin), false, "");

  improvementScoreEl.innerHTML =
    `<div class="score-main">${safeNum(score.score)} <small>${score.grade || "-"}</small></div>` +
    `<div class="score-sub">Higher score means closer to high-level Karma targets.</div>`;
  focusTargetsEl.innerHTML = focus.length
    ? focus.map((entry) => `<li>${entry}</li>`).join("")
    : "<li>No urgent target gaps detected.</li>";

  renderTrendChart(insights.trend || []);

  laneStatsEl.innerHTML =
    line("Gold Diff @14", safeNum(lane.avgGoldDiff14).toFixed(1)) +
    line("XP Diff @14", safeNum(lane.avgXpDiff14).toFixed(1)) +
    line("Assists before 14", safeNum(lane.avgAssistsBefore14).toFixed(2)) +
    line("Deaths before 14", safeNum(lane.avgDeathsBefore14).toFixed(2)) +
    line("First death minute", safeNum(lane.avgFirstDeathMin).toFixed(2));

  if (!matchups.length) {
    matchupBodyEl.innerHTML = `<tr><td colspan="7">No matchup data yet.</td></tr>`;
  } else {
    matchupBodyEl.innerHTML = matchups
      .map((row) => {
        return (
          "<tr>" +
          `<td>${row.enemySupport || "-"}</td>` +
          `<td>${row.enemyBot || "-"}</td>` +
          `<td>${safeNum(row.games)}</td>` +
          `<td>${safeNum(row.winRate).toFixed(1)}%</td>` +
          `<td>${safeNum(row.avgKillParticipation).toFixed(1)}%</td>` +
          `<td>${safeNum(row.avgDeaths).toFixed(2)}</td>` +
          `<td>${safeNum(row.avgVisionPerMin).toFixed(2)}</td>` +
          "</tr>"
        );
      })
      .join("");
  }
}

async function fetchStats() {
  const query = new URLSearchParams();
  if (selectedOtpPuuId) {
    query.set("otp_puu_id", selectedOtpPuuId);
  }

  const response = await fetch(`/api/stats?${query.toString()}`, {
    cache: "no-store",
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const reason = payload.error || `Request failed with ${response.status}`;
    const endpoint = payload.endpoint ? ` Endpoint: ${payload.endpoint}.` : "";
    const detail = payload.detail ? ` ${String(payload.detail).slice(0, 120)}` : "";
    throw new Error(`${reason}${endpoint}${detail}`.trim());
  }
  return payload;
}

async function refreshStats() {
  searchBtnEl.disabled = true;
  otpSelectEl.disabled = true;
  setStatus("Loading feelsbanman#EUW stats...");
  setOtpStatus("Loading KR OTP comparison...");

  try {
    const payload = await fetchStats();
    renderDashboard(payload);
    renderOtpComparison(payload);
    renderKarmaInsights(payload);
    setStatus(`Loaded latest 5 EUW matches for feelsbanman#EUW (Karma setup sampled from 30 games).`);
  } catch (error) {
    dashboardEl.classList.add("hidden");
    setStatus(error.message || "Failed to load stats.");
    setOtpStatus("OTP comparison unavailable.");
  } finally {
    searchBtnEl.disabled = false;
  }
}

otpSelectEl.addEventListener("change", async () => {
  selectedOtpPuuId = otpSelectEl.value || "";
  await refreshStats();
});

otpRunesBtnEl.addEventListener("click", () => {
  openRunesModal("otp");
});

yourRunesBtnEl.addEventListener("click", () => {
  openRunesModal("you");
});

closeRunesModalEl.addEventListener("click", () => {
  runesModalEl.classList.add("hidden");
});

runesModalEl.addEventListener("click", (event) => {
  if (event.target === runesModalEl) {
    runesModalEl.classList.add("hidden");
  }
});

searchFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  await refreshStats();
});

void refreshStats();
