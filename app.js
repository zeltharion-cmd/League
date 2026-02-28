const searchFormEl = document.getElementById("searchForm");
const searchBtnEl = document.getElementById("searchBtn");
const statusTextEl = document.getElementById("statusText");
const dashboardEl = document.getElementById("dashboard");
const matchupStatusEl = document.getElementById("matchupStatus");
const setupHeadlineEl = document.getElementById("setupHeadline");

const gameNameInputEl = document.getElementById("gameNameInput");
const tagLineInputEl = document.getElementById("tagLineInput");
const regionSelectEl = document.getElementById("regionSelect");

const enemySupportSearchEl = document.getElementById("enemySupportSearch");
const enemyBotSearchEl = document.getElementById("enemyBotSearch");
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

const customizeBtnEl = document.getElementById("customizeBtn");
const customizeModalEl = document.getElementById("customizeModal");
const closeCustomizeModalEl = document.getElementById("closeCustomizeModal");
const rainToggleEl = document.getElementById("rainToggle");
const presetGridEl = document.getElementById("presetGrid");
const applyThemeBtnEl = document.getElementById("applyThemeBtn");
const resetThemeBtnEl = document.getElementById("resetThemeBtn");

const improvementScoreEl = document.getElementById("improvementScore");
const focusTargetsEl = document.getElementById("focusTargets");
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

const THEME_INPUT_IDS = {
  "--bg-0": "color-bg-0",
  "--bg-1": "color-bg-1",
  "--panel": "color-panel",
  "--panel-soft": "color-panel-soft",
  "--ink": "color-ink",
  "--muted": "color-muted",
  "--gold": "color-gold",
  "--gold-strong": "color-gold-strong",
  "--accent": "color-accent",
};

const PRESET_THEMES = [
  {
    name: "Rift Gold",
    vars: { "--bg-0": "#060b14", "--bg-1": "#0a1526", "--panel": "#0f2138", "--panel-soft": "#132a46", "--ink": "#f4ead4", "--muted": "#a6bdd2", "--gold": "#c8a461", "--gold-strong": "#f0d08f", "--accent": "#41a5d3" },
  },
  {
    name: "Arc Light",
    vars: { "--bg-0": "#0b0f1b", "--bg-1": "#1d2946", "--panel": "#1d2e54", "--panel-soft": "#2d4374", "--ink": "#e7f4ff", "--muted": "#9dc4df", "--gold": "#7fb8ff", "--gold-strong": "#b3dbff", "--accent": "#53d2ff" },
  },
  {
    name: "Infernal",
    vars: { "--bg-0": "#150806", "--bg-1": "#2d1109", "--panel": "#32150f", "--panel-soft": "#4b2417", "--ink": "#ffe7d1", "--muted": "#d8b49e", "--gold": "#ff8a47", "--gold-strong": "#ffc08d", "--accent": "#ff5d3a" },
  },
  {
    name: "Elderwood",
    vars: { "--bg-0": "#06130e", "--bg-1": "#123024", "--panel": "#173a2d", "--panel-soft": "#20523f", "--ink": "#e9f8ec", "--muted": "#9fcab4", "--gold": "#88c26b", "--gold-strong": "#bee9a2", "--accent": "#57d390" },
  },
  {
    name: "Void",
    vars: { "--bg-0": "#0b0616", "--bg-1": "#1f1036", "--panel": "#251645", "--panel-soft": "#372365", "--ink": "#f1e8ff", "--muted": "#b7a8d6", "--gold": "#a178ff", "--gold-strong": "#c8acff", "--accent": "#8c5bff" },
  },
  {
    name: "Hextech",
    vars: { "--bg-0": "#061014", "--bg-1": "#0d2833", "--panel": "#113745", "--panel-soft": "#1a495a", "--ink": "#e9f8ff", "--muted": "#9fc2cf", "--gold": "#31b5d0", "--gold-strong": "#88e2f5", "--accent": "#4ce6ff" },
  },
  {
    name: "Nightfall",
    vars: { "--bg-0": "#0f1014", "--bg-1": "#191d2a", "--panel": "#20283a", "--panel-soft": "#2a344c", "--ink": "#eff2fa", "--muted": "#a4afc3", "--gold": "#9aa6bf", "--gold-strong": "#d7deef", "--accent": "#7f92bf" },
  },
  {
    name: "Bilgewater",
    vars: { "--bg-0": "#071015", "--bg-1": "#13222b", "--panel": "#1a3039", "--panel-soft": "#25444f", "--ink": "#eaf7f4", "--muted": "#a7c8bf", "--gold": "#61bca0", "--gold-strong": "#9de5cc", "--accent": "#3fd6b2" },
  },
  {
    name: "Sandstorm",
    vars: { "--bg-0": "#151006", "--bg-1": "#2b1f0d", "--panel": "#3a2b15", "--panel-soft": "#594323", "--ink": "#fff1d5", "--muted": "#ddc59b", "--gold": "#d2a757", "--gold-strong": "#f4d499", "--accent": "#f0bf6a" },
  },
  {
    name: "Neon Matrix",
    vars: { "--bg-0": "#030d09", "--bg-1": "#0b2217", "--panel": "#0d2f20", "--panel-soft": "#114430", "--ink": "#d8ffe8", "--muted": "#8ed6b0", "--gold": "#3fe28f", "--gold-strong": "#88ffc0", "--accent": "#27f2a4" },
  },
];

const THEME_STORAGE_KEY = "kk_theme_vars";
const RAIN_STORAGE_KEY = "kk_rain";

let selectedEnemySupportId = 0;
let selectedEnemyBotId = 0;
let supportOptionsAll = [];
let botOptionsAll = [];
let matchupRunesCache = {};
let yourRunesCache = {};

function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function setStatus(message) {
  statusTextEl.textContent = message;
}

function setMatchupStatus(message) {
  matchupStatusEl.textContent = message;
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

function applyRainEnabled(enabled) {
  if (enabled) {
    document.body.classList.remove("rain-off");
  } else {
    document.body.classList.add("rain-off");
  }
  rainToggleEl.checked = enabled;
  localStorage.setItem(RAIN_STORAGE_KEY, enabled ? "1" : "0");
}

function readCurrentThemeVars() {
  const computed = getComputedStyle(document.documentElement);
  const values = {};
  for (const key of Object.keys(THEME_INPUT_IDS)) {
    values[key] = computed.getPropertyValue(key).trim() || "#000000";
  }
  return values;
}

function applyThemeVars(values) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(values)) {
    if (!THEME_INPUT_IDS[key]) {
      continue;
    }
    root.style.setProperty(key, value);
  }
}

function syncThemeInputsFromVars(values) {
  for (const [cssKey, inputId] of Object.entries(THEME_INPUT_IDS)) {
    const input = document.getElementById(inputId);
    if (!input) {
      continue;
    }
    input.value = values[cssKey] || "#000000";
  }
}

function saveThemeVars(values) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(values));
}

function loadSavedThemeVars() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function buildPresetButtons() {
  presetGridEl.innerHTML = PRESET_THEMES
    .map((preset, idx) => `<button type="button" class="preset-btn" data-preset-index="${idx}">${preset.name}</button>`)
    .join("");
  for (const button of presetGridEl.querySelectorAll(".preset-btn")) {
    button.addEventListener("click", () => {
      const index = safeNum(button.getAttribute("data-preset-index"));
      const preset = PRESET_THEMES[index] || PRESET_THEMES[0];
      applyThemeVars(preset.vars);
      syncThemeInputsFromVars(readCurrentThemeVars());
      saveThemeVars(readCurrentThemeVars());
    });
  }
}

function initThemeControls() {
  buildPresetButtons();

  const savedTheme = loadSavedThemeVars();
  if (savedTheme) {
    applyThemeVars(savedTheme);
  }
  syncThemeInputsFromVars(readCurrentThemeVars());

  const rainSaved = localStorage.getItem(RAIN_STORAGE_KEY);
  applyRainEnabled(rainSaved !== "0");

  customizeBtnEl.addEventListener("click", () => {
    customizeModalEl.classList.remove("hidden");
  });

  closeCustomizeModalEl.addEventListener("click", () => {
    customizeModalEl.classList.add("hidden");
  });

  customizeModalEl.addEventListener("click", (event) => {
    if (event.target === customizeModalEl) {
      customizeModalEl.classList.add("hidden");
    }
  });

  rainToggleEl.addEventListener("change", () => {
    applyRainEnabled(Boolean(rainToggleEl.checked));
  });

  applyThemeBtnEl.addEventListener("click", () => {
    const values = {};
    for (const [cssKey, inputId] of Object.entries(THEME_INPUT_IDS)) {
      const input = document.getElementById(inputId);
      values[cssKey] = input?.value || "#000000";
    }
    applyThemeVars(values);
    saveThemeVars(values);
  });

  resetThemeBtnEl.addEventListener("click", () => {
    const base = PRESET_THEMES[0].vars;
    applyThemeVars(base);
    syncThemeInputsFromVars(readCurrentThemeVars());
    saveThemeVars(readCurrentThemeVars());
    applyRainEnabled(true);
  });
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

function filterChampionOptions(options, searchText) {
  const term = String(searchText || "").trim().toLowerCase();
  if (!term) {
    return options;
  }
  return options.filter((option) => String(option.name || "").toLowerCase().includes(term));
}

function renderMatchupFilters() {
  const supportOptions = filterChampionOptions(supportOptionsAll, enemySupportSearchEl.value);
  const botOptions = filterChampionOptions(botOptionsAll, enemyBotSearchEl.value);
  renderChampionSelect(enemySupportSelectEl, supportOptions, selectedEnemySupportId, "Select enemy support");
  renderChampionSelect(enemyBotSelectEl, botOptions, selectedEnemyBotId, "Select enemy bot carry");
}

function renderDashboard(payload) {
  const player = payload.player || {};
  const aggregate = payload.aggregate || {};
  const support = payload.supportInsights || {};
  const matches = Array.isArray(payload.recentMatches) ? payload.recentMatches : [];

  playerHeadingEl.textContent = `${player.gameName || "feelsbanman"} #${player.tagLine || "EUW"}`;
  profileMetaEl.innerHTML =
    `<div>Region: <strong>${String(regionSelectEl.value || "euw1").toUpperCase()}</strong></div>` +
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
  supportOptionsAll = Array.isArray(data.supportChampionOptions)
    ? data.supportChampionOptions
    : (Array.isArray(data.championOptions) ? data.championOptions : []);
  botOptionsAll = Array.isArray(data.botChampionOptions)
    ? data.botChampionOptions
    : (Array.isArray(data.championOptions) ? data.championOptions : []);

  selectedEnemySupportId = selectedEnemySupportId || safeNum(data.selectedEnemySupportId);
  selectedEnemyBotId = selectedEnemyBotId || safeNum(data.selectedEnemyBotId);
  renderMatchupFilters();

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
    setupHeadlineEl.textContent = "Unable to load your Karma setup right now.";
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
    line("Missing vs High WR", missingCore || "-");

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

  setupHeadlineEl.textContent =
    `Your Karma setup: ${yourCore || "-"} (${yourRunes.keystone || "No keystone"}). ` +
    `Best vs ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}: ${matchupCore || "-"}.`;

  setMatchupStatus(
    `Loaded highest-winrate Diamond+ matchup model: ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}.`
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
    `<div class="score-sub">Your support impact score. Push this up by closing the target gaps below.</div>`;
  focusTargetsEl.innerHTML = focus.length
    ? focus.map((entry) => `<li>${entry}</li>`).join("")
    : "<li>No urgent target gaps detected.</li>";

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
      .map((row) => (
        "<tr>" +
        `<td>${row.enemySupport || "-"}</td>` +
        `<td>${row.enemyBot || "-"}</td>` +
        `<td>${safeNum(row.games)}</td>` +
        `<td>${safeNum(row.winRate).toFixed(1)}%</td>` +
        `<td>${safeNum(row.avgKillParticipation).toFixed(1)}%</td>` +
        `<td>${safeNum(row.avgDeaths).toFixed(2)}</td>` +
        `<td>${safeNum(row.avgVisionPerMin).toFixed(2)}</td>` +
        "</tr>"
      ))
      .join("");
  }
}

async function fetchStats() {
  const query = new URLSearchParams();
  query.set("game_name", gameNameInputEl.value.trim() || "feelsbanman");
  query.set("tag_line", tagLineInputEl.value.trim() || "EUW");
  query.set("platform", regionSelectEl.value || "euw1");

  if (selectedEnemySupportId > 0) {
    query.set("enemy_support_id", String(selectedEnemySupportId));
  }
  if (selectedEnemyBotId > 0) {
    query.set("enemy_bot_id", String(selectedEnemyBotId));
  }

  const response = await fetch(`/api/stats?${query.toString()}`, { cache: "no-store" });

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

  const gameName = gameNameInputEl.value.trim() || "feelsbanman";
  const tagLine = tagLineInputEl.value.trim() || "EUW";
  const platform = (regionSelectEl.value || "euw1").toUpperCase();

  setStatus(`Loading ${gameName}#${tagLine} on ${platform}...`);
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
      `Loaded latest 5 ${platform} matches for ${gameName}#${tagLine}. High-winrate matchup model loaded for ${support} + ${bot}.`
    );
  } catch (error) {
    dashboardEl.classList.add("hidden");
    setStatus(error.message || "Failed to load stats.");
    setMatchupStatus("Matchup model unavailable.");
    setupHeadlineEl.textContent = "Unable to load your Karma setup right now.";
  } finally {
    searchBtnEl.disabled = false;
  }
}

enemySupportSearchEl.addEventListener("input", () => {
  renderMatchupFilters();
});

enemyBotSearchEl.addEventListener("input", () => {
  renderMatchupFilters();
});

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
  selectedEnemySupportId = 0;
  selectedEnemyBotId = 0;
  await refreshStats();
});

initThemeControls();
void refreshStats();
