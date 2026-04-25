const searchFormEl = document.getElementById("searchForm");
const searchBtnEl = document.getElementById("searchBtn");
const statusTextEl = document.getElementById("statusText");
const dashboardEl = document.getElementById("dashboard");
const championAnalysisPanelEl = document.getElementById("championAnalysisPanel");
const profileTabEls = Array.from(document.querySelectorAll("[data-tab]"));
const tabPanelEls = Array.from(document.querySelectorAll("[data-tab-panel]"));
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
const matchupBuildIconsEl = document.getElementById("matchupBuildIcons");
const enemyPairVisualEl = document.getElementById("enemyPairVisual");
const matchupMetaEl = document.getElementById("matchupMeta");
const matchupAdviceEl = document.getElementById("matchupAdvice");
const matchupRunesBtnEl = document.getElementById("matchupRunesBtn");
const matchupBuildTitleEl = document.getElementById("matchupBuildTitle");
const matchupMetaTitleEl = document.getElementById("matchupMetaTitle");
const matchupAdviceTitleEl = document.getElementById("matchupAdviceTitle");
const matchupChampionPortraitEl = document.getElementById("matchupChampionPortrait");
const matchupHeroTitleEl = document.getElementById("matchupHeroTitle");
const matchupHeroSubtitleEl = document.getElementById("matchupHeroSubtitle");
const matchupHeroIconsEl = document.getElementById("matchupHeroIcons");
const matchupSourceBadgeEl = document.getElementById("matchupSourceBadge");
const matchupStatsStripEl = document.getElementById("matchupStatsStrip");
const matchupRunesPreviewEl = document.getElementById("matchupRunesPreview");

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
const profileIconImageEl = document.getElementById("profileIconImage");
const profileIconFallbackEl = document.getElementById("profileIconFallback");
const profileLevelBadgeEl = document.getElementById("profileLevelBadge");
const gamesMetricEl = document.getElementById("gamesMetric");
const winRateMetricEl = document.getElementById("winRateMetric");
const kdaMetricEl = document.getElementById("kdaMetric");
const csMetricEl = document.getElementById("csMetric");
const rankEmblemEl = document.getElementById("rankEmblem");
const rankTitleEl = document.getElementById("rankTitle");
const rankSubtitleEl = document.getElementById("rankSubtitle");
const supportRoleMetricEl = document.getElementById("supportRoleMetric");
const supportRateMetricEl = document.getElementById("supportRateMetric");
const supportVisionMetricEl = document.getElementById("supportVisionMetric");
const supportControlMetricEl = document.getElementById("supportControlMetric");
const supportKpMetricEl = document.getElementById("supportKpMetric");
const supportUtilityMetricEl = document.getElementById("supportUtilityMetric");
const matchesBodyEl = document.getElementById("matchesBody");
const loadMoreMatchesBtnEl = document.getElementById("loadMoreMatchesBtn");
const tierGraphBtnEl = document.getElementById("tierGraphBtn");
const matrixRainCanvasEl = document.getElementById("matrixRain");
const pageQueryParams = new URLSearchParams(window.location.search);
const includeTimelineMode =
  pageQueryParams.get("timeline") === "1" ||
  pageQueryParams.get("include_timeline") === "1";

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
    name: "Ethereal",
    vars: { "--bg-0": "#f7f7f4", "--bg-1": "#ededed", "--panel": "#ffffff", "--panel-soft": "#f8f8f6", "--ink": "#080808", "--muted": "#686861", "--gold": "#151515", "--gold-strong": "#000000", "--accent": "#ffffff" },
  },
  {
    name: "Obsidian",
    vars: { "--bg-0": "#050505", "--bg-1": "#101010", "--panel": "#0d0d0d", "--panel-soft": "#171717", "--ink": "#f7f7f2", "--muted": "#b8b8b0", "--gold": "#f1f1ea", "--gold-strong": "#ffffff", "--accent": "#2b2b2b" },
  },
  {
    name: "Porcelain",
    vars: { "--bg-0": "#f5f3ef", "--bg-1": "#e7e3da", "--panel": "#fffdf8", "--panel-soft": "#eee9df", "--ink": "#171511", "--muted": "#786f62", "--gold": "#2c2923", "--gold-strong": "#090807", "--accent": "#ffffff" },
  },
  {
    name: "Moonlit",
    vars: { "--bg-0": "#eceff2", "--bg-1": "#d9dde2", "--panel": "#fbfcfd", "--panel-soft": "#eef1f4", "--ink": "#0b0d10", "--muted": "#687079", "--gold": "#1d2228", "--gold-strong": "#000000", "--accent": "#ffffff" },
  },
  {
    name: "Ink",
    vars: { "--bg-0": "#e9e7e1", "--bg-1": "#d5d2ca", "--panel": "#f9f8f4", "--panel-soft": "#eeeae2", "--ink": "#070707", "--muted": "#5d5a54", "--gold": "#111111", "--gold-strong": "#000000", "--accent": "#c8c4ba" },
  },
  {
    name: "Frost",
    vars: { "--bg-0": "#f2f6f7", "--bg-1": "#dfe8ea", "--panel": "#ffffff", "--panel-soft": "#edf4f5", "--ink": "#071012", "--muted": "#607174", "--gold": "#102022", "--gold-strong": "#000000", "--accent": "#ffffff" },
  },
];

const THEME_STORAGE_KEY = "kk_theme_vars_v6";
const RAIN_STORAGE_KEY = "kk_rain";

let selectedEnemySupportId = 0;
let selectedEnemyBotId = 0;
let championOptionsAll = [];
let supportOptionsAll = [];
let botOptionsAll = [];
let matchupRunesCache = {};
let matrixRainController = null;
let currentMatchLimit = 15;
let activeProfileTab = "summary";
let dashboardHasData = false;

const MATCH_LIMIT_INITIAL = 15;
const MATCH_LIMIT_STEP = 10;
const MATCH_LIMIT_MAX = 50;

function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function setText(el, value) {
  if (!el) {
    return;
  }
  el.textContent = value == null ? "" : String(value);
}

function setHtml(el, value) {
  if (!el) {
    return;
  }
  el.innerHTML = value == null ? "" : String(value);
}

function setStatus(message) {
  setText(statusTextEl, message);
}

function setMatchupStatus(message) {
  setText(matchupStatusEl, message);
}

function setActiveProfileTab(tabName) {
  const panelExists = tabPanelEls.some((panelEl) => panelEl.dataset.tabPanel === tabName);
  activeProfileTab = panelExists ? tabName : "summary";

  for (const tabEl of profileTabEls) {
    const isActive = tabEl.dataset.tab === activeProfileTab;
    tabEl.classList.toggle("active", isActive);
    tabEl.setAttribute("aria-selected", isActive ? "true" : "false");
  }

  for (const panelEl of tabPanelEls) {
    const isActive = panelEl.dataset.tabPanel === activeProfileTab;
    panelEl.hidden = !isActive || (activeProfileTab === "summary" && !dashboardHasData);
  }
}

function formatRankTitle(rankedSolo) {
  if (!rankedSolo || !rankedSolo.tier) {
    return "Unranked";
  }
  const tier = String(rankedSolo.tier || "").toUpperCase();
  const division = String(rankedSolo.rank || "").toUpperCase();
  const tierName = tier.charAt(0) + tier.slice(1).toLowerCase();
  return ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)
    ? tierName
    : `${tierName} ${division || ""}`.trim();
}

function rankInitial(rankedSolo) {
  const tier = String(rankedSolo?.tier || "").trim();
  return tier ? tier.charAt(0).toUpperCase() : "-";
}

function rankTierClass(rankedSolo) {
  const tier = String(rankedSolo?.tier || "unranked").toLowerCase();
  return `rank-tier-${tier || "unranked"}`;
}

function line(label, value) {
  return (
    `<div class="kv-row">` +
    `<strong class="kv-label">${label}</strong>` +
    `<span class="kv-value">${value}</span>` +
    `</div>`
  );
}

function renderWinrateSources(sources) {
  if (!Array.isArray(sources) || !sources.length) {
    return "-";
  }
  const visible = sources.filter((source) => safeNum(source?.games) > 0);
  if (!visible.length) {
    return "-";
  }
  return visible
    .map((source) => {
      const rawName = String(source?.name || "Source");
      const name = rawName
        .replace("Deeplol Matchup (Diamond+)", "Deeplol Diamond+ Matchup")
        .replace("Riot Same Matchup (Recent)", "Riot Same Matchup")
        .replace("Combined Matchup Model", "Combined Model")
        .replace("Riot Your Karma (Recent)", "Your Karma Recent")
        .replace("General Karma Benchmark", "General Karma OTP Build")
        .replace("General Karma OTP Build", "General Karma OTP Build");
      const wr = `${safeNum(source?.winRate).toFixed(1)}%`;
      const games = safeNum(source?.games);
      return (
        `<article class="source-card">` +
        `<span>${name}</span>` +
        `<strong>${wr}</strong>` +
        `<small>${games} games</small>` +
        `</article>`
      );
    })
    .join("");
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

function renderCompactIconStrip(items) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }
  return items
    .filter((item) => item?.icon)
    .map((item) => (
      `<div class="hero-icon" title="${item.name || ""}">` +
      `<img src="${item.icon}" alt="${item.name || ""}" loading="lazy">` +
      `</div>`
    ))
    .join("");
}

function renderPortrait(option, titleText) {
  if (!matchupChampionPortraitEl) {
    return;
  }
  if (!option?.icon) {
    setHtml(matchupChampionPortraitEl, `<div class="portrait-fallback">${titleText || "K"}</div>`);
    return;
  }
  setHtml(
    matchupChampionPortraitEl,
    `<img src="${option.icon}" alt="${option.name || "Karma"}" loading="lazy">`
  );
}

function renderStatsStrip(items) {
  if (!matchupStatsStripEl) {
    return;
  }
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!safeItems.length) {
    setHtml(matchupStatsStripEl, "");
    return;
  }
  setHtml(
    matchupStatsStripEl,
    safeItems
      .map((item) => (
        `<article class="metric-tile">` +
        `<span>${item.label || "-"}</span>` +
        `<strong>${item.value || "-"}</strong>` +
        `</article>`
      ))
      .join("")
  );
}

function renderRunePreview(bestRunes, bestBuild) {
  if (!matchupRunesPreviewEl) {
    return;
  }
  const keystone = Array.isArray(bestRunes?.keystoneDetailed) ? bestRunes.keystoneDetailed : [];
  const primary = Array.isArray(bestRunes?.primaryRunesDetailed) ? bestRunes.primaryRunesDetailed : [];
  const secondary = Array.isArray(bestRunes?.secondaryRunesDetailed) ? bestRunes.secondaryRunesDetailed : [];
  const shards = Array.isArray(bestRunes?.statShardsDetailed) ? bestRunes.statShardsDetailed : [];
  const spells = Array.isArray(bestBuild?.summonerSpellsDetailed) ? bestBuild.summonerSpellsDetailed : [];

  const iconRow = (title, entries, round = true) => {
    const safeEntries = Array.isArray(entries) ? entries.filter((entry) => entry?.icon) : [];
    if (!safeEntries.length) {
      return "";
    }
    return (
      `<section class="preview-section">` +
      `<div class="preview-section-head">` +
      `<span>${title}</span>` +
      `<strong>${safeEntries.length}</strong>` +
      `</div>` +
      `<div class="preview-icons">` +
      safeEntries
        .map((entry) => (
          `<div class="preview-icon-card" title="${entry.name || ""}">` +
          `<div class="preview-icon${round ? " round" : ""}">` +
          `<img src="${entry.icon}" alt="${entry.name || ""}" loading="lazy">` +
          `</div>` +
          `<span>${entry.name || ""}</span>` +
          `</div>`
        ))
        .join("") +
      `</div>` +
      `</section>`
    );
  };

  const html =
    iconRow("Keystone", keystone) +
    iconRow("Primary", primary) +
    iconRow("Secondary", secondary) +
    iconRow("Shards", shards) +
    iconRow("Spells", spells, false);

  setHtml(matchupRunesPreviewEl, html || "<div class='stack-text'>No rune preview available.</div>");
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

function openRunesModal() {
  if (!runesTitleEl || !runesBodyEl || !runesModalEl) {
    return;
  }
  const runes = matchupRunesCache;
  setText(runesTitleEl, "Recommended Matchup Rune Page");
  setHtml(
    runesBodyEl,
    runeSection("Primary", runes.primary || []) +
    runeSection("Secondary", runes.secondary || []) +
    runeSection("Shards", runes.shards || [])
  );
  runesModalEl.classList.remove("hidden");
}

function applyRainEnabled(enabled) {
  if (enabled) {
    document.body.classList.remove("rain-off");
  } else {
    document.body.classList.add("rain-off");
  }
  if (rainToggleEl) {
    rainToggleEl.checked = enabled;
  }
  if (matrixRainController) {
    matrixRainController.setEnabled(enabled);
  }
  try {
    localStorage.setItem(RAIN_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Storage can be blocked in some browser modes; controls should still work.
  }
}

function createMatrixRainController() {
  if (!matrixRainCanvasEl) {
    return null;
  }

  const canvas = matrixRainCanvasEl;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const charset = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&*+-=<>[]{}";
  const fontSize = 16;
  let columns = 0;
  let drops = [];
  let running = false;
  let frameId = 0;
  let lastFrameAt = 0;
  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  function resizeCanvas() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.max(1, Math.floor(width / fontSize));
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * Math.floor(height / fontSize)));
  }

  function getFrameColors() {
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue("--accent").trim() || "#e9f4ff";
    const bg = style.getPropertyValue("--bg-0").trim() || "#000000";
    return { accent, bg };
  }

  function drawFrame(timestamp) {
    if (!running) {
      return;
    }

    if (timestamp - lastFrameAt < 55) {
      frameId = window.requestAnimationFrame(drawFrame);
      return;
    }
    lastFrameAt = timestamp;

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const { accent, bg } = getFrameColors();

    context.fillStyle = `${bg}20`;
    context.fillRect(0, 0, width, height);

    context.font = `700 ${fontSize}px "Consolas", "Courier New", monospace`;
    context.textBaseline = "top";
    context.shadowColor = accent;
    context.shadowBlur = 6;

    for (let idx = 0; idx < drops.length; idx += 1) {
      const letter = charset[Math.floor(Math.random() * charset.length)];
      const x = idx * fontSize;
      const y = drops[idx] * fontSize;

      context.fillStyle = accent;
      context.fillText(letter, x, y);

      if (y > height && Math.random() > 0.975) {
        drops[idx] = 0;
      } else {
        drops[idx] += 1;
      }
    }

    frameId = window.requestAnimationFrame(drawFrame);
  }

  function start() {
    if (running) {
      return;
    }
    running = true;
    canvas.classList.remove("hidden");
    lastFrameAt = 0;
    frameId = window.requestAnimationFrame(drawFrame);
  }

  function stop() {
    running = false;
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    canvas.classList.add("hidden");
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  return {
    setEnabled(enabled) {
      if (enabled) {
        start();
      } else {
        stop();
      }
    },
  };
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
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Storage is optional; applying the theme immediately is the important part.
  }
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
  if (!presetGridEl) {
    return;
  }
  setHtml(
    presetGridEl,
    PRESET_THEMES
    .map((preset, idx) => `<button type="button" class="preset-btn" data-preset-index="${idx}">${preset.name}</button>`)
    .join("")
  );
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
  if (!customizeBtnEl || !customizeModalEl || !closeCustomizeModalEl || !applyThemeBtnEl || !resetThemeBtnEl) {
    return;
  }
  buildPresetButtons();

  const savedTheme = loadSavedThemeVars();
  if (savedTheme) {
    applyThemeVars(savedTheme);
  }
  syncThemeInputsFromVars(readCurrentThemeVars());

  let rainSaved = null;
  try {
    rainSaved = localStorage.getItem(RAIN_STORAGE_KEY);
  } catch {
    rainSaved = null;
  }
  applyRainEnabled(rainSaved === "1");

  customizeBtnEl.addEventListener("click", (event) => {
    event.preventDefault();
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

  if (rainToggleEl) {
    rainToggleEl.addEventListener("change", () => {
      applyRainEnabled(Boolean(rainToggleEl.checked));
    });
  }

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
  if (!selectEl) {
    return;
  }
  if (!Array.isArray(options) || !options.length) {
    setHtml(selectEl, `<option value="0">No champions</option>`);
    selectEl.disabled = true;
    return;
  }
  setHtml(
    selectEl,
    `<option value="0">${placeholder}</option>` +
    options
      .map((option) => {
        const id = safeNum(option.id);
        const selectedAttr = id === selected ? " selected" : "";
        return `<option value="${id}"${selectedAttr}>${option.name || `Champion ${id}`}</option>`;
      })
      .join("")
  );
  selectEl.disabled = false;
}

function filterChampionOptions(options, searchText) {
  const term = String(searchText || "").trim().toLowerCase();
  if (!term) {
    return options;
  }
  return options.filter((option) => String(option.name || "").toLowerCase().includes(term));
}

function findChampionOptionById(championId) {
  const targetId = safeNum(championId);
  if (targetId <= 0) {
    return null;
  }

  const pools = [championOptionsAll, supportOptionsAll, botOptionsAll];
  for (const pool of pools) {
    if (!Array.isArray(pool)) {
      continue;
    }
    const found = pool.find((option) => safeNum(option.id) === targetId);
    if (found) {
      return found;
    }
  }
  return null;
}

function findChampionOptionInPayload(payload, championId) {
  const targetId = safeNum(championId);
  const matchup = payload?.karmaMatchup || {};
  const pools = [
    matchup.championOptions,
    matchup.supportChampionOptions,
    matchup.botChampionOptions,
    championOptionsAll,
    supportOptionsAll,
    botOptionsAll,
  ];

  for (const pool of pools) {
    if (!Array.isArray(pool)) {
      continue;
    }
    const found = pool.find((option) => safeNum(option.id) === targetId);
    if (found) {
      return found;
    }
  }
  return null;
}

function renderEnemyPair(data) {
  if (!enemyPairVisualEl) {
    return;
  }

  const supportId = safeNum(data?.selectedEnemySupportId);
  const botId = safeNum(data?.selectedEnemyBotId);
  const supportOption = findChampionOptionById(supportId);
  const botOption = findChampionOptionById(botId);
  const supportName = supportOption?.name || data?.selectedEnemySupport || "Enemy Support";
  const botName = botOption?.name || data?.selectedEnemyBot || "Enemy Bot";

  const chip = (label, name, icon) =>
    `<div class="enemy-chip">` +
    (icon ? `<img src="${icon}" alt="${name}" loading="lazy">` : "") +
    `<span><strong>${label}:</strong> ${name}</span>` +
    `</div>`;

  setHtml(
    enemyPairVisualEl,
    chip("Support", supportName, supportOption?.icon || "") +
    chip("Bot", botName, botOption?.icon || "")
  );
}

function renderMatchupFilters() {
  const supportOptions = filterChampionOptions(supportOptionsAll, enemySupportSearchEl?.value || "");
  const botOptions = filterChampionOptions(botOptionsAll, enemyBotSearchEl?.value || "");
  renderChampionSelect(enemySupportSelectEl, supportOptions, selectedEnemySupportId, "Select enemy support");
  renderChampionSelect(enemyBotSelectEl, botOptions, selectedEnemyBotId, "Select enemy bot carry");
}

function renderDashboard(payload) {
  const player = payload.player || {};
  const rankedSolo = player.rankedSolo || {};
  const aggregate = payload.aggregate || {};
  const support = payload.supportInsights || {};
  const matches = Array.isArray(payload.recentMatches) ? payload.recentMatches : [];
  const ddragonVersion = payload.ddragonVersion || "";
  const profileIconId = safeNum(player.profileIconId);

  setText(playerHeadingEl, `${player.gameName || "feelsbanman"} #${player.tagLine || "EUW"}`);
  setText(profileLevelBadgeEl, safeNum(player.summonerLevel) || "-");
  if (profileIconImageEl && profileIconFallbackEl) {
    if (ddragonVersion && profileIconId > 0) {
      profileIconImageEl.src = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${profileIconId}.png`;
      profileIconImageEl.alt = `${player.gameName || "Player"} profile icon`;
      profileIconImageEl.hidden = false;
      profileIconFallbackEl.hidden = true;
    } else {
      profileIconImageEl.hidden = true;
      profileIconFallbackEl.hidden = false;
    }
  }
  setHtml(
    profileMetaEl,
    `<div>${String(regionSelectEl?.value || "euw1").toUpperCase()}</div>` +
    `<div>Rank: <strong>${formatRankTitle(rankedSolo)}</strong></div>` +
    `<div>Level: <strong>${safeNum(player.summonerLevel) || "-"}</strong></div>`
  );

  setText(rankEmblemEl, rankInitial(rankedSolo));
  if (rankEmblemEl) {
    rankEmblemEl.className = `rank-emblem ${rankTierClass(rankedSolo)}`;
  }
  setText(rankTitleEl, formatRankTitle(rankedSolo));
  setText(
    rankSubtitleEl,
    rankedSolo?.tier
      ? `${safeNum(rankedSolo.leaguePoints)} LP - ${safeNum(rankedSolo.wins)}W ${safeNum(rankedSolo.losses)}L`
      : "Ranked Solo/Duo"
  );

  setText(gamesMetricEl, safeNum(aggregate.games));
  setText(winRateMetricEl, `${safeNum(aggregate.winRate).toFixed(1)}%`);
  setText(kdaMetricEl, safeNum(aggregate.avgKda).toFixed(2));
  setText(csMetricEl, safeNum(aggregate.avgCs).toFixed(1));
  setText(supportRoleMetricEl, String(support.primaryRole || "UNKNOWN").replace("UTILITY", "SUPPORT"));
  setText(supportRateMetricEl, `${safeNum(support.supportRate).toFixed(1)}%`);
  setText(supportVisionMetricEl, safeNum(support.avgVisionScore).toFixed(1));
  setText(supportControlMetricEl, safeNum(support.avgControlWards).toFixed(1));
  setText(supportKpMetricEl, `${safeNum(support.avgKillParticipation).toFixed(1)}%`);
  setText(supportUtilityMetricEl, safeNum(support.avgAllyUtility).toLocaleString());

  if (!matches.length) {
    setHtml(matchesBodyEl, `<div class="empty-row">No recent matches found.</div>`);
  } else {
    setHtml(
      matchesBodyEl,
      matches
      .map((match) => {
        const win = match.result === "Win";
        const role = String(match.role || "UNKNOWN").replace("UTILITY", "SUPPORT");
        const kda = `${safeNum(match.kills)} / ${safeNum(match.deaths)} / ${safeNum(match.assists)}`;
        const championOption = findChampionOptionInPayload(payload, match.championId);
        const championName = championOption?.name || match.champion || "Unknown";
        const championImage = championOption?.icon
          ? `<img class="match-champion-img" src="${championOption.icon}" alt="${championName}" loading="lazy">`
          : `<span class="match-champion-fallback">${String(championName).charAt(0) || "?"}</span>`;
        return (
          `<article class="match-card ${win ? "win" : "loss"}">` +
          `<div class="match-result-bar"></div>` +
          `<div class="match-champion">${championImage}</div>` +
          `<div class="match-main">` +
          `<strong>${championName}</strong>` +
          `<span>${role} - ${safeNum(match.durationMin).toFixed(1)}m</span>` +
          `<span class="match-result">${win ? "Victory" : "Defeat"}</span>` +
          `</div>` +
          `<div class="match-stat match-kda">` +
          `<strong>${kda}</strong>` +
          `<span>KDA ${safeNum(match.killParticipation).toFixed(1)}% KP</span>` +
          `</div>` +
          `<div class="match-stat optional"><strong>${safeNum(match.cs)}</strong><span>CS</span></div>` +
          `<div class="match-stat optional"><strong>${safeNum(match.visionScore)}</strong><span>Vision</span></div>` +
          `<div class="match-stat optional"><strong>${safeNum(match.controlWards)}</strong><span>Control</span></div>` +
          `<div class="match-stat optional"><strong>${safeNum(match.gold).toLocaleString()}</strong><span>Gold</span></div>` +
          `</article>`
        );
      })
      .join("")
    );
  }

  if (loadMoreMatchesBtnEl) {
    const reachedEnd = matches.length < currentMatchLimit || matches.length >= MATCH_LIMIT_MAX;
    loadMoreMatchesBtnEl.hidden = reachedEnd;
    loadMoreMatchesBtnEl.disabled = false;
    loadMoreMatchesBtnEl.textContent = reachedEnd
      ? "All available matches loaded"
      : `Load more matches (${matches.length}/${MATCH_LIMIT_MAX})`;
  }

  if (dashboardEl) {
    dashboardHasData = true;
    dashboardEl.classList.remove("hidden");
    setActiveProfileTab(activeProfileTab);
  }
}

function renderHighEloMatchup(payload) {
  const data = payload.karmaMatchup || {};
  championOptionsAll = Array.isArray(data.championOptions) ? data.championOptions : [];
  supportOptionsAll = Array.isArray(data.supportChampionOptions)
    ? data.supportChampionOptions
    : (Array.isArray(data.championOptions) ? data.championOptions : []);
  botOptionsAll = Array.isArray(data.botChampionOptions)
    ? data.botChampionOptions
    : (Array.isArray(data.championOptions) ? data.championOptions : []);

  selectedEnemySupportId = selectedEnemySupportId || safeNum(data.selectedEnemySupportId);
  selectedEnemyBotId = selectedEnemyBotId || safeNum(data.selectedEnemyBotId);
  renderMatchupFilters();
  renderEnemyPair(data);

  const bestBuild = data.bestBuild || {};
  const bestRunes = data.bestRunes || {};
  const aggregate = data.aggregate || {};
  const advice = Array.isArray(data.advice) ? data.advice : [];
  const recommendationMode = String(data.recommendationMode || "");
  const karmaOption = findChampionOptionById(43) || { name: "Karma", icon: "" };

  if (data.error) {
    renderPortrait(karmaOption, "K");
    setText(matchupHeroTitleEl, "Karma recommendation unavailable");
    setText(matchupHeroSubtitleEl, data.error || "Unable to load matchup recommendation right now.");
    setText(matchupSourceBadgeEl, "Unavailable");
    setHtml(matchupHeroIconsEl, "");
    renderStatsStrip([]);
    setHtml(matchupRunesPreviewEl, "<div class='stack-text'>No rune preview available.</div>");
    setText(matchupBuildTitleEl, "Matchup Build");
    setText(matchupMetaTitleEl, "Sample / Filter");
    setText(matchupAdviceTitleEl, "Execution Notes");
    setHtml(matchupBuildEl, line("Status", data.error) + line("Detail", data.detail || "No detail"));
    setHtml(matchupBuildIconsEl, "");
    setHtml(matchupMetaEl, line("Filter", "Diamond+") + line("Sample", "0 games"));
    setHtml(matchupAdviceEl, "<li>Retry after refresh.</li>");
    setMatchupStatus(data.error);
    setText(setupHeadlineEl, "Unable to load matchup recommendation right now.");
    return;
  }

  if (data.recommendationAvailable === false) {
    renderPortrait(karmaOption, "K");
    setText(matchupHeroTitleEl, `No valid setup vs ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}`);
    setText(matchupHeroSubtitleEl, "No matchup-specific build cleared the minimum win-rate floor.");
    setText(matchupSourceBadgeEl, data.eloFilter || "No Match");
    setHtml(matchupHeroIconsEl, "");
    renderStatsStrip([
      { label: "Matchup WR", value: `${safeNum(data.aggregate?.winRate).toFixed(1)}%` },
      { label: "Sample", value: `${safeNum(data.sampleMatches)} games` },
      { label: "Rule", value: ">50.0% floor" },
    ]);
    setHtml(matchupRunesPreviewEl, "<div class='stack-text'>No coherent rune page passed the filter for this botlane.</div>");
    setText(matchupBuildTitleEl, "Matchup Build Unavailable");
    setText(matchupMetaTitleEl, "Sample / Filter");
    setText(matchupAdviceTitleEl, "Execution Notes");
    setHtml(
      matchupBuildEl,
      line("Enemy Support", data.selectedEnemySupport || "-") +
      line("Enemy Bot", data.selectedEnemyBot || "-") +
      line("Status", "No recommendation available above 50% win rate.")
    );
    setHtml(matchupBuildIconsEl, "");
    setHtml(
      matchupMetaEl,
      line("Filter", data.eloFilter || "Diamond+ only") +
      line("Sample", `${safeNum(data.sampleMatches)} games (${safeNum(data.aggregate?.winRate).toFixed(1)}% WR)`) +
      line("Rule", "Only show recommendations with >50.0% WR (matchup, build, runes)") +
      line("Cross-Source WR", renderWinrateSources(data.winrateSources)) +
      line("Data Note", data.dataNote || "")
    );
    const advice = Array.isArray(data.advice) ? data.advice : [];
    setHtml(
      matchupAdviceEl,
      advice.length ? advice.map((entry) => `<li>${entry}</li>`).join("") : "<li>No valid high-winrate setup found.</li>"
    );
    matchupRunesCache = { primary: [], secondary: [], shards: [] };
    setText(
      setupHeadlineEl,
      `No >50% Diamond+ recommendation found vs ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}.`
    );
    setMatchupStatus("No valid matchup recommendation above 50% win rate.");
    return;
  }

  const matchupCore = Array.isArray(bestBuild.coreItems) ? bestBuild.coreItems.join(" -> ") : "-";
  const matchupSpells = Array.isArray(bestBuild.summonerSpells) ? bestBuild.summonerSpells.join(" + ") : "-";
  const isGeneralFallback = recommendationMode === "general_fallback";
  const heroIcons = [
    ...(Array.isArray(bestBuild.coreItemsDetailed) ? bestBuild.coreItemsDetailed.slice(0, 3) : []),
    ...(Array.isArray(bestBuild.bootsDetailed) ? bestBuild.bootsDetailed.slice(0, 1) : []),
    ...(Array.isArray(bestBuild.summonerSpellsDetailed) ? bestBuild.summonerSpellsDetailed.slice(0, 2) : []),
  ];

  renderPortrait(karmaOption, "K");
  setHtml(matchupHeroIconsEl, renderCompactIconStrip(heroIcons));
  renderRunePreview(bestRunes, bestBuild);

  if (isGeneralFallback) {
    setText(matchupHeroTitleEl, `Karma fallback vs ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}`);
    setText(matchupHeroSubtitleEl, data.fallbackReason || "Showing a general high-winrate Karma setup.");
    setText(matchupSourceBadgeEl, data.eloFilter || "Fallback");
    renderStatsStrip([
      { label: "Fallback WR", value: `${safeNum(bestBuild.winRate).toFixed(1)}%` },
      { label: "Benchmark", value: `${safeNum(bestBuild.games)} games` },
      { label: "Matchup WR", value: `${safeNum(aggregate.winRate).toFixed(1)}%` },
      { label: "Botlane", value: `${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}` },
    ]);
    setText(matchupBuildTitleEl, "General Karma Fallback");
    setText(matchupMetaTitleEl, "Karma Player Comparison");
    setText(matchupAdviceTitleEl, "Fallback Notes");
    setHtml(
      matchupBuildEl,
      line("Current Botlane", `${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}`) +
      line("Recommendation", data.recommendationLabel || "General high-winrate Karma fallback") +
      line("Reason", data.fallbackReason || "No matchup-specific build cleared the threshold.") +
      line("Core Build", matchupCore || "-") +
      line("Boots", bestBuild.boots || "-") +
      line("Spells", matchupSpells || "-") +
      line("Keystone", bestRunes.keystone || "-") +
      line("Primary Tree", bestRunes.primaryStyle || "-") +
      line("Secondary Tree", bestRunes.secondaryStyle || "-")
    );

    const fallbackIcons = [
      ...(Array.isArray(bestBuild.coreItemsDetailed) ? bestBuild.coreItemsDetailed : []),
      ...(Array.isArray(bestBuild.bootsDetailed) ? bestBuild.bootsDetailed : []),
      ...(Array.isArray(bestBuild.summonerSpellsDetailed) ? bestBuild.summonerSpellsDetailed : []),
    ];
    setHtml(matchupBuildIconsEl, renderIconRow(fallbackIcons));

    setHtml(
      matchupMetaEl,
      line("Build Source", `${data.source || "Deeplol"} (${data.region || "KR"})`) +
      line("Build Basis", data.eloFilter || "Top KR Karma OTP Build") +
      line("Current Matchup", `${safeNum(data.sampleMatches)} games (${safeNum(aggregate.winRate).toFixed(1)}% WR)`) +
      line("Fallback WR", `${safeNum(bestBuild.winRate).toFixed(1)}% across ${safeNum(bestBuild.games)} OTP games`) +
      line("Cross-Source WR", renderWinrateSources(data.winrateSources)) +
      line("Data Note", data.dataNote || "")
    );

    setHtml(
      matchupAdviceEl,
      advice.length
        ? advice.map((entry) => `<li>${entry}</li>`).join("")
        : "<li>Use the fallback build as the stable default into this botlane.</li>"
    );

    matchupRunesCache = {
      primary: [
        ...(Array.isArray(bestRunes.keystoneDetailed) ? bestRunes.keystoneDetailed : []),
        ...(Array.isArray(bestRunes.primaryRunesDetailed) ? bestRunes.primaryRunesDetailed : []),
      ],
      secondary: Array.isArray(bestRunes.secondaryRunesDetailed) ? bestRunes.secondaryRunesDetailed : [],
      shards: Array.isArray(bestRunes.statShardsDetailed) ? bestRunes.statShardsDetailed : [],
    };

    setText(
      setupHeadlineEl,
      `Fallback Karma setup vs ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}: ` +
      `${matchupCore || "-"} (${bestRunes.keystone || "No keystone"}).`
    );
    setMatchupStatus("No matchup-specific setup cleared the threshold. Showing a general high-winrate Karma build.");
    return;
  }

  setText(matchupHeroTitleEl, `Karma build vs ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}`);
  setText(
    matchupHeroSubtitleEl,
    `${safeNum(bestBuild.winRate).toFixed(1)}% build WR, ${safeNum(bestRunes.winRate).toFixed(1)}% rune WR, ${safeNum(aggregate.winRate).toFixed(1)}% matchup WR.`
  );
  setText(matchupSourceBadgeEl, data.eloFilter || "Diamond+");
  renderStatsStrip([
    { label: "Build WR", value: `${safeNum(bestBuild.winRate).toFixed(1)}%` },
    { label: "Rune WR", value: `${safeNum(bestRunes.winRate).toFixed(1)}%` },
    { label: "Matchup WR", value: `${safeNum(aggregate.winRate).toFixed(1)}%` },
    { label: "Sample", value: `${safeNum(data.sampleMatches)} games` },
  ]);
  setText(matchupBuildTitleEl, "Best Build Vs Current Botlane");
  setText(matchupMetaTitleEl, "Karma Player Comparison");
  setText(matchupAdviceTitleEl, "Execution Notes");

  setHtml(
    matchupBuildEl,
    line("Enemy Support", data.selectedEnemySupport || "-") +
    line("Enemy Bot", data.selectedEnemyBot || "-") +
    line("Sample", `${safeNum(data.sampleMatches)} games (${safeNum(aggregate.winRate).toFixed(1)}% WR)`) +
    line("Core Build", matchupCore || "-") +
    line("Boots", bestBuild.boots || "-") +
    line("Spells", matchupSpells || "-") +
    line("Keystone", bestRunes.keystone || "-") +
    line("Primary Tree", bestRunes.primaryStyle || "-") +
    line("Secondary Tree", bestRunes.secondaryStyle || "-")
  );

  const matchupIcons = [
    ...(Array.isArray(bestBuild.coreItemsDetailed) ? bestBuild.coreItemsDetailed : []),
    ...(Array.isArray(bestBuild.bootsDetailed) ? bestBuild.bootsDetailed : []),
    ...(Array.isArray(bestBuild.summonerSpellsDetailed) ? bestBuild.summonerSpellsDetailed : []),
  ];
  setHtml(matchupBuildIconsEl, renderIconRow(matchupIcons));

  setHtml(
    matchupMetaEl,
    line("Source", `${data.source || "Deeplol"} (${data.region || "KR"})`) +
    line("Elo Filter", data.eloFilter || "DIAMOND+") +
    line("Build WR", `${safeNum(bestBuild.winRate).toFixed(1)}% in ${safeNum(bestBuild.games)} games`) +
    line("Rune WR", `${safeNum(bestRunes.winRate).toFixed(1)}% in ${safeNum(bestRunes.games)} games`) +
    line("Cross-Source WR", renderWinrateSources(data.winrateSources)) +
    line("Data Note", data.dataNote || "")
  );

  const filteredAdvice = advice.filter((entry) => !/\b(your|you)\b/i.test(String(entry || "")));
  setHtml(
    matchupAdviceEl,
    filteredAdvice.length
      ? filteredAdvice.map((entry) => `<li>${entry}</li>`).join("")
      : "<li>Use the recommended core and rune page for this enemy botlane.</li>"
  );

  matchupRunesCache = {
    primary: [
      ...(Array.isArray(bestRunes.keystoneDetailed) ? bestRunes.keystoneDetailed : []),
      ...(Array.isArray(bestRunes.primaryRunesDetailed) ? bestRunes.primaryRunesDetailed : []),
    ],
    secondary: Array.isArray(bestRunes.secondaryRunesDetailed) ? bestRunes.secondaryRunesDetailed : [],
    shards: Array.isArray(bestRunes.statShardsDetailed) ? bestRunes.statShardsDetailed : [],
  };

  setText(
    setupHeadlineEl,
    `Best Karma setup vs ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"}: ` +
    `${matchupCore || "-"} (${bestRunes.keystone || "No keystone"}).`
  );

  setMatchupStatus(
    `Loaded recommendation for ${data.selectedEnemySupport || "-"} + ${data.selectedEnemyBot || "-"} (${data.source || "model"}).`
  );
}

function renderKarmaInsights(payload) {
  const insights = payload.karmaInsights || {};
  const lane = insights.lanePhase || {};
  const score = insights.improvementScore || {};
  const matchups = Array.isArray(insights.matchups) ? insights.matchups : [];
  const focus = Array.isArray(score.focusTargets) ? score.focusTargets : [];

  setHtml(
    improvementScoreEl,
    `<div class="score-main">${safeNum(score.score)} <small>${score.grade || "-"}</small></div>` +
    `<div class="score-sub">Your support impact score. Push this up by closing the target gaps below.</div>`
  );
  setHtml(
    focusTargetsEl,
    focus.length
      ? focus.map((entry) => `<li>${entry}</li>`).join("")
      : "<li>No urgent target gaps detected.</li>"
  );

  setHtml(
    laneStatsEl,
    line("Gold Diff @14", safeNum(lane.avgGoldDiff14).toFixed(1)) +
    line("XP Diff @14", safeNum(lane.avgXpDiff14).toFixed(1)) +
    line("Assists before 14", safeNum(lane.avgAssistsBefore14).toFixed(2)) +
    line("Deaths before 14", safeNum(lane.avgDeathsBefore14).toFixed(2)) +
    line("First death minute", safeNum(lane.avgFirstDeathMin).toFixed(2))
  );

  if (!matchups.length) {
    setHtml(matchupBodyEl, `<tr><td colspan="7">No matchup data yet.</td></tr>`);
  } else {
    setHtml(
      matchupBodyEl,
      matchups
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
      .join("")
    );
  }
}

async function fetchStats() {
  const query = new URLSearchParams();
  query.set("game_name", gameNameInputEl?.value?.trim() || "feelsbanman");
  query.set("tag_line", tagLineInputEl?.value?.trim() || "EUW");
  query.set("platform", regionSelectEl?.value || "euw1");
  query.set("matches", String(currentMatchLimit));
  if (includeTimelineMode) {
    query.set("timeline", "1");
  }

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
  if (searchBtnEl) {
    searchBtnEl.disabled = true;
  }
  if (enemySupportSelectEl) {
    enemySupportSelectEl.disabled = true;
  }
  if (enemyBotSelectEl) {
    enemyBotSelectEl.disabled = true;
  }
  if (loadMoreMatchesBtnEl) {
    loadMoreMatchesBtnEl.disabled = true;
  }

  const gameName = gameNameInputEl?.value?.trim() || "feelsbanman";
  const tagLine = tagLineInputEl?.value?.trim() || "EUW";
  const platform = (regionSelectEl?.value || "euw1").toUpperCase();

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
      `Loaded latest ${payload.recentMatches?.length || currentMatchLimit} ${platform} matches for ${gameName}#${tagLine}. High-winrate matchup model loaded for ${support} + ${bot}.`
    );
  } catch (error) {
    if (dashboardEl) {
      dashboardHasData = false;
      dashboardEl.classList.add("hidden");
      dashboardEl.hidden = true;
    }
    setStatus(error.message || "Failed to load stats.");
    setMatchupStatus("Matchup model unavailable.");
    setText(setupHeadlineEl, "Unable to load matchup recommendation right now.");
  } finally {
    if (searchBtnEl) {
      searchBtnEl.disabled = false;
    }
    if (loadMoreMatchesBtnEl) {
      loadMoreMatchesBtnEl.disabled = false;
    }
  }
}

if (enemySupportSearchEl) {
  enemySupportSearchEl.addEventListener("input", () => {
    renderMatchupFilters();
  });
}

if (enemyBotSearchEl) {
  enemyBotSearchEl.addEventListener("input", () => {
    renderMatchupFilters();
  });
}

if (enemySupportSelectEl) {
  enemySupportSelectEl.addEventListener("change", async () => {
    selectedEnemySupportId = safeNum(enemySupportSelectEl.value);
    await refreshStats();
  });
}

if (enemyBotSelectEl) {
  enemyBotSelectEl.addEventListener("change", async () => {
    selectedEnemyBotId = safeNum(enemyBotSelectEl.value);
    await refreshStats();
  });
}

if (matchupRunesBtnEl) {
  matchupRunesBtnEl.addEventListener("click", () => {
    openRunesModal();
  });
}

if (closeRunesModalEl && runesModalEl) {
  closeRunesModalEl.addEventListener("click", () => {
    runesModalEl.classList.add("hidden");
  });
}

if (runesModalEl) {
  runesModalEl.addEventListener("click", (event) => {
    if (event.target === runesModalEl) {
      runesModalEl.classList.add("hidden");
    }
  });
}

if (searchFormEl) {
  searchFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    currentMatchLimit = MATCH_LIMIT_INITIAL;
    selectedEnemySupportId = 0;
    selectedEnemyBotId = 0;
    await refreshStats();
  });
}

if (loadMoreMatchesBtnEl) {
  loadMoreMatchesBtnEl.addEventListener("click", async () => {
    currentMatchLimit = Math.min(MATCH_LIMIT_MAX, currentMatchLimit + MATCH_LIMIT_STEP);
    await refreshStats();
  });
}

if (tierGraphBtnEl) {
  tierGraphBtnEl.addEventListener("click", () => {
    setActiveProfileTab("summary");
    setStatus("Tier Graph uses the Summary performance cards and match history for now.");
  });
}

for (const tabEl of profileTabEls) {
  tabEl.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveProfileTab(tabEl.dataset.tab);
  });
}

function boot() {
  try {
    matrixRainController = createMatrixRainController();
    initThemeControls();
    setActiveProfileTab("summary");
    void refreshStats();
  } catch (error) {
    setStatus(error?.message || "The page failed to initialize. Refresh and try again.");
    setActiveProfileTab("summary");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
