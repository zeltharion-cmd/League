const searchFormEl = document.getElementById("searchForm");
const searchBtnEl = document.getElementById("searchBtn");
const statusTextEl = document.getElementById("statusText");
const dashboardEl = document.getElementById("dashboard");
const matchupStatusEl = document.getElementById("matchupStatus");

const enemySupportSelectEl = document.getElementById("enemySupportSelect");
const enemyBotSelectEl = document.getElementById("enemyBotSelect");
const matchupBuildEl = document.getElementById("matchupBuild");
const yourBuildEl = document.getElementById("yourBuild");
const matchupBuildIconsEl = document.getElementById("matchupBuildIcons");
const yourBuildIconsEl = document.getElementById("yourBuildIcons");
const matchupMetaEl = document.getElementById("matchupMeta");
const matchupAdviceEl = document.getElementById("matchupAdvice");
const matchupRunesBtnEl = document.getElementById("matchupRunesBtn");
const yourRunesBtnEl = document.getElementById("yourRunesBtn");

const runesModalEl = document.getElementById("runesModal");
const closeRunesModalEl = document.getElementById("closeRunesModal");
const runesTitleEl = document.getElementById("runesTitle");
const runesBodyEl = document.getElementById("runesBody");

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

let selectedEnemySupportId = 0;
let selectedEnemyBotId = 0;
let matchupRunesCache = {};
let yourRunesCache = {};

function setStatus(message) {
  statusTextEl.textContent = message;
}

function setMatchupStatus(message) {
  matchupStatusEl.textContent = message;
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
  const isMatchup = type === "matchup";
  const runes = isMatchup ? matchupRunesCache : yourRunesCache;
  runesTitleEl.textContent = isMatchup ? "High Elo Matchup Rune Page" : "Your Rune Page";
  runesBodyEl.innerHTML =
    runeSection("Primary", runes.primary || []) +
    runeSection("Secondary", runes.secondary || []) +
    runeSection("Shards", runes.shards || []);
  runesModalEl.classList.remove("hidden");
}

function renderChampionSelect(selectEl, options, selected, placeholder) {
  if (!Array.isArray(options) || !options.length) {
    selectEl.innerHTML = `<option value="0">No champions</option>`;
    selectEl.disabled = true;
    return;
  }
  selectEl.innerHTML =
    `<option value="0">${placeholder}</option>` +
    options
      .map((option) => {
        const id = safeNum(option.id);
        const selectedAttr = id === selected ? " selected" : "";
        return `<option value="${id}"${selectedAttr}>${option.name || `Champion ${id}`}</option>`;
      })
      .join("");
  selectEl.disabled = false;
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

function renderHighEloMatchup(payload) {
  const data = payload.karmaMatchup || {};
  const options = Array.isArray(data.championOptions) ? data.championOptions : [];

  selectedEnemySupportId = selectedEnemySupportId || safeNum(data.selectedEnemySupportId);
  selectedEnemyBotId = selectedEnemyBotId || safeNum(data.selectedEnemyBotId);

  renderChampionSelect(enemySupportSelectEl, options, selectedEnemySupportId, "Select enemy support");
  renderChampionSelect(enemyBotSelectEl, options, selectedEnemyBotId, "Select enemy bot carry");

  const bestBuild = data.bestBuild || {};
  const bestRunes = data.bestRunes || {};
  const your = data.you || {};
  const yourRunes = your.runes || {};
  const aggregate = data.aggregate || {};
  const comparison = data.comparison || {};
  const advice = Array.isArray(data.advice) ? data.advice : [];

  if (data.error) {
    matchupBuildEl.innerHTML = line("Status", data.error) + line("Detail", data.detail || "No detail");
    matchupBuildIconsEl.innerHTML = "";
    yourBuildEl.innerHTML = line("Your Setup", "Unavailable");
    yourBuildIconsEl.innerHTML = "";
    matchupMetaEl.innerHTML = line("Filter", "Diamond+") + line("Sample", "0 games");
    matchupAdviceEl.innerHTML = "<li>Retry after refresh.</li>";
    setMatchupStatus(data.error);
    return;
  }

  const matchupCore = Array.isArray(bestBuild.coreItems) ? bestBuild.coreItems.join(" -> ") : "-";
  const matchupSpells = Array.isArray(bestBuild.summonerSpells) ? bestBuild.summonerSpells.join(" + ") : "-";
  const yourCore = Array.isArray(your.coreItems) ? your.coreItems.join(" -> ") : "-";
  const yourSpells = Array.isArray(your.summonerSpells) ? your.summonerSpells.join(" + ") : "-";
  const missingCore = Array.isArray(comparison.missingFromYourCore) ? comparison.missingFromYourCore.join(", ") : "-";

  matchupBuildEl.innerHTML =
    line("Enemy Support", data.selectedEnemySupport || "-") +
    line("Enemy Bot", data.selectedEnemyBot || "-") +
    line("Sample", `${safeNum(data.sampleMatches)} games (${safeNum(aggregate.winRate).toFixed(1)}% WR)`) +
    line("Core Build", matchupCore || "-") +
    line("Boots", bestBuild.boots || "-") +
    line("Spells", matchupSpells || "-") +
    line("Keystone", bestRunes.keystone || "-") +
    line("Primary Tree", bestRunes.primaryStyle || "-") +
    line("Secondary Tree", bestRunes.secondaryStyle || "-");

  const matchupIcons = [
    ...(Array.isArray(bestBuild.coreItemsDetailed) ? bestBuild.coreItemsDetailed : []),
    ...(Array.isArray(bestBuild.bootsDetailed) ? bestBuild.bootsDetailed : []),
    ...(Array.isArray(bestBuild.summonerSpellsDetailed) ? bestBuild.summonerSpellsDetailed : []),
  ];
  matchupBuildIconsEl.innerHTML = renderIconRow(matchupIcons);

  yourBuildEl.innerHTML =
    line("Your Karma Sample", `${safeNum(your.karmaGames)} games (${safeNum(your.karmaWinRate).toFixed(1)}% WR)`) +
    line("Core Build", yourCore || "-") +
    line("Boots", your.boots || "-") +
    line("Spells", yourSpells || "-") +
    line("Keystone", yourRunes.keystone || "-") +
    line("Primary Tree", yourRunes.primaryStyle || "-") +
    line("Secondary Tree", yourRunes.secondaryStyle || "-") +
    line("Missing vs High Elo", missingCore || "-");

  const yourIcons = [
    ...(Array.isArray(your.coreItemsDetailed) ? your.coreItemsDetailed : []),
    ...(Array.isArray(your.bootsDetailed) ? your.bootsDetailed : []),
    ...(Array.isArray(your.summonerSpellsDetailed) ? your.summonerSpellsDetailed : []),
  ];
  yourBuildIconsEl.innerHTML = renderIconRow(yourIcons);

  matchupMetaEl.innerHTML =
    line("Source", `${data.source || "Deeplol"} (${data.region || "KR"})`) +
    line("Elo Filter", data.eloFilter || "DIAMOND+") +
    line("Build WR", `${safeNum(bestBuild.winRate).toFixed(1)}% in ${safeNum(bestBuild.games)} games`) +
    line("Rune WR", `${safeNum(bestRunes.winRate).toFixed(1)}% in ${safeNum(bestRunes.games)} games`) +
    line("Data Note", data.dataNote || "");

  matchupAdviceEl.innerHTML = advice.length
    ? advice.map((entry) => `<li>${entry}</li>`).join("")
    : "<li>No urgent changes detected for this matchup pair.</li>";

  matchupRunesCache = {
    primary: [
      ...(Array.isArray(bestRunes.keystoneDetailed) ? bestRunes.keystoneDetailed : []),
      ...(Array.isArray(bestRunes.primaryRunesDetailed) ? bestRunes.primaryRunesDetailed : []),
    ],
    secondary: Array.isArray(bestRunes.secondaryRunesDetailed) ? bestRunes.secondaryRunesDetailed : [],
    shards: Array.isArray(bestRunes.statShardsDetailed) ? bestRunes.statShardsDetailed : [],
  };

  yourRunesCache = {
    primary: [
      ...(Array.isArray(yourRunes.keystoneDetailed) ? yourRunes.keystoneDetailed : []),
      ...(Array.isArray(yourRunes.primaryRunesDetailed) ? yourRunes.primaryRunesDetailed : []),
    ],
    secondary: Array.isArray(yourRunes.secondaryRunesDetailed) ? yourRunes.secondaryRunesDetailed : [],
    shards: Array.isArray(yourRunes.statShardsDetailed) ? yourRunes.statShardsDetailed : [],
  };

  setMatchupStatus(
    `Loaded Diamond+ matchup model: ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}.`
  );
}

function renderKarmaInsights(payload) {
  const insights = payload.karmaInsights || {};
  const lane = insights.lanePhase || {};
  const score = insights.improvementScore || {};
  const matchups = Array.isArray(insights.matchups) ? insights.matchups : [];
  const focus = Array.isArray(score.focusTargets) ? score.focusTargets : [];

  improvementScoreEl.innerHTML =
    `<div class="score-main">${safeNum(score.score)} <small>${score.grade || "-"}</small></div>` +
    `<div class="score-sub">Closer to high-level support targets means stronger consistency.</div>`;
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
  if (selectedEnemySupportId > 0) {
    query.set("enemy_support_id", String(selectedEnemySupportId));
  }
  if (selectedEnemyBotId > 0) {
    query.set("enemy_bot_id", String(selectedEnemyBotId));
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
    const detail = payload.detail ? ` ${String(payload.detail).slice(0, 140)}` : "";
    throw new Error(`${reason}${endpoint}${detail}`.trim());
  }
  return payload;
}

async function refreshStats() {
  searchBtnEl.disabled = true;
  enemySupportSelectEl.disabled = true;
  enemyBotSelectEl.disabled = true;
  setStatus("Loading feelsbanman#EUW stats...");
  setMatchupStatus("Loading Diamond+ matchup recommendations...");

  try {
    const payload = await fetchStats();
    selectedEnemySupportId = safeNum(payload.karmaMatchup?.selectedEnemySupportId);
    selectedEnemyBotId = safeNum(payload.karmaMatchup?.selectedEnemyBotId);

    renderDashboard(payload);
    renderHighEloMatchup(payload);
    renderKarmaInsights(payload);

    const support = payload.karmaMatchup?.selectedEnemySupport || "-";
    const bot = payload.karmaMatchup?.selectedEnemyBot || "-";
    setStatus(
      `Loaded latest 5 EUW matches. High-elo matchup model loaded for ${support} + ${bot}.`
    );
  } catch (error) {
    dashboardEl.classList.add("hidden");
    setStatus(error.message || "Failed to load stats.");
    setMatchupStatus("Matchup model unavailable.");
  } finally {
    searchBtnEl.disabled = false;
  }
}

enemySupportSelectEl.addEventListener("change", async () => {
  selectedEnemySupportId = safeNum(enemySupportSelectEl.value);
  await refreshStats();
});

enemyBotSelectEl.addEventListener("change", async () => {
  selectedEnemyBotId = safeNum(enemyBotSelectEl.value);
  await refreshStats();
});

matchupRunesBtnEl.addEventListener("click", () => {
  openRunesModal("matchup");
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
