/**
 * 商業分析 (BA) 互動複習系統 - 核心前端應用程式
 * 純原生 JavaScript SPA，支援離線執行、零外部建置相依
 */

// 全域狀態
let currentUnitId = "ch02-descriptive";
let currentLevel = 0;
let isWeaknessMode = false;
let dynamicQuestionCache = {}; // 暫存動態隨機題

// DOM 元素快取
let elUnitListContainer;
let elLevelTabsContainer;
let elContentArea;
let elUnitHeaderArea;
let elOverallMasteryText;
let elOverallProgressBar;
let elStatMastered;
let elStatReview;
let elStatUnattempted;
let elActiveModeBadge;

// 初始化入口
document.addEventListener("DOMContentLoaded", () => {
  // 綁定 DOM
  elUnitListContainer = document.getElementById("unitListContainer");
  elLevelTabsContainer = document.getElementById("levelTabsContainer");
  elContentArea = document.getElementById("contentArea");
  elUnitHeaderArea = document.getElementById("unitHeaderArea");
  elOverallMasteryText = document.getElementById("overallMasteryText");
  elOverallProgressBar = document.getElementById("overallProgressBar");
  elStatMastered = document.getElementById("statMasteredCount");
  elStatReview = document.getElementById("statReviewCount");
  elStatUnattempted = document.getElementById("statUnattemptedCount");
  elActiveModeBadge = document.getElementById("activeModeBadge");

  // 讀取上次造訪狀態
  const savedData = StudyStorage.getData();
  if (savedData.lastActiveUnit) currentUnitId = savedData.lastActiveUnit;
  if (savedData.lastActiveLevel !== undefined) currentLevel = savedData.lastActiveLevel;

  // 註冊頂部功能按鈕事件
  setupGlobalActions();

  // 監聽 Storage 更新
  window.addEventListener("study-storage-updated", () => {
    updateProgressUI();
  });

  // 首次渲染 UI
  renderSidebarUnits();
  renderLevelTabs();
  updateProgressUI();
  renderMainContent();
});

// ==========================================
// 數學公式渲染輔助函式 (KaTeX)
// ==========================================
function renderMath(container) {
  if (!container) return;
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(container, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render error:", e);
    }
  }
}

// ==========================================
// 全域動作與彈跳視窗綁定
// ==========================================
function setupGlobalActions() {
  // 弱點清剿模式按鈕
  const btnWeakness = document.getElementById("btnWeaknessMode");
  const btnMobileWeakness = document.getElementById("btnMobileWeakness");
  const toggleWeakness = () => {
    isWeaknessMode = !isWeaknessMode;
    btnWeakness.classList.toggle("btn-amber", isWeaknessMode);
    btnWeakness.classList.toggle("btn-secondary", !isWeaknessMode);
    if (btnMobileWeakness) {
      btnMobileWeakness.classList.toggle("btn-amber", isWeaknessMode);
      btnMobileWeakness.classList.toggle("btn-secondary", !isWeaknessMode);
    }
    elActiveModeBadge.textContent = isWeaknessMode ? "🎯 弱點清剿中" : "全部單元";
    elActiveModeBadge.className = `badge ${isWeaknessMode ? "badge-review" : "badge-unattempted"}`;
    renderMainContent();
  };
  btnWeakness.addEventListener("click", toggleWeakness);
  if (btnMobileWeakness) btnMobileWeakness.addEventListener("click", toggleWeakness);

  // 考前救急包彈窗
  const btnCram = document.getElementById("btnQuickCram");
  const btnMobileCram = document.getElementById("btnMobileCram");
  const cramModal = document.getElementById("cramModal");
  const btnCloseCram = document.getElementById("btnCloseCramModal");
  const openCram = () => {
    renderCramModal();
    cramModal.style.display = "flex";
  };
  btnCram.addEventListener("click", openCram);
  if (btnMobileCram) btnMobileCram.addEventListener("click", openCram);
  btnCloseCram.addEventListener("click", () => {
    cramModal.style.display = "none";
  });

  // 戰力分析儀表板彈窗
  const btnDashboard = document.getElementById("btnDashboard");
  const btnMobileDashboard = document.getElementById("btnMobileDashboard");
  const dashboardModal = document.getElementById("dashboardModal");
  const btnCloseDashboard = document.getElementById("btnCloseDashboardModal");
  const openDashboard = () => {
    renderDashboardModal();
    dashboardModal.style.display = "flex";
  };
  btnDashboard.addEventListener("click", openDashboard);
  if (btnMobileDashboard) btnMobileDashboard.addEventListener("click", openDashboard);
  btnCloseDashboard.addEventListener("click", () => {
    dashboardModal.style.display = "none";
  });

  // 側邊欄資料備份與重設
  document.getElementById("btnExportSidebar").addEventListener("click", () => {
    StudyStorage.exportBackup();
  });
  document.getElementById("btnResetSidebar").addEventListener("click", () => {
    if (confirm("確定要重設所有作答進度與掌握度紀錄嗎？此動作無法復原。")) {
      StudyStorage.resetAll();
      dynamicQuestionCache = {};
      renderSidebarUnits();
      updateProgressUI();
      renderMainContent();
      alert("學習進度已成功重設！");
    }
  });

  // 點擊遮罩關閉彈窗
  window.addEventListener("click", (e) => {
    if (e.target === cramModal) cramModal.style.display = "none";
    if (e.target === dashboardModal) dashboardModal.style.display = "none";
  });
}

// ==========================================
// 側邊欄單元導覽與進度更新
// ==========================================
function renderSidebarUnits() {
  const stats = StudyStorage.calculateStats(RAW_QUESTIONS);
  elUnitListContainer.innerHTML = "";

  UNITS.forEach((unit) => {
    const uStat = stats.unitStats[unit.id] || { total: 0, mastered: 0 };
    const pct = uStat.total > 0 ? Math.round((uStat.mastered / uStat.total) * 100) : 0;
    const isActive = unit.id === currentUnitId;

    const card = document.createElement("button");
    card.className = `unit-card ${isActive ? "active" : ""}`;
    card.innerHTML = `
      <div class="unit-card-header">
        <span class="unit-title">${unit.icon} ${unit.shortName}</span>
        <span style="font-size: 0.8rem; font-family: var(--font-mono); font-weight: 700; color: ${pct === 100 ? "#10b981" : "#94a3b8"};">${pct}%</span>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3; margin-bottom: 0.4rem;">
        ${unit.desc}
      </div>
      <div class="unit-progress-container">
        <div class="unit-progress-bar" style="width: ${pct}%;"></div>
      </div>
    `;

    card.addEventListener("click", () => {
      currentUnitId = unit.id;
      StudyStorage.setLastActive(currentUnitId, currentLevel);
      renderSidebarUnits();
      renderMainContent();
    });

    elUnitListContainer.appendChild(card);
  });
}

function updateProgressUI() {
  const stats = StudyStorage.calculateStats(RAW_QUESTIONS);
  elOverallMasteryText.textContent = `${stats.overallMasteryPct}%`;
  elOverallProgressBar.style.width = `${stats.overallMasteryPct}%`;
  elStatMastered.textContent = stats.mastered;
  elStatReview.textContent = stats.reviewNeeded;
  elStatUnattempted.textContent = stats.unattempted;

  // 更新各單元百分比
  const cards = elUnitListContainer.querySelectorAll(".unit-card");
  UNITS.forEach((u, idx) => {
    const card = cards[idx];
    if (card) {
      const uStat = stats.unitStats[u.id] || { total: 0, mastered: 0 };
      const pct = uStat.total > 0 ? Math.round((uStat.mastered / uStat.total) * 100) : 0;
      const bar = card.querySelector(".unit-progress-bar");
      if (bar) bar.style.width = `${pct}%`;
    }
  });
}

function renderLevelTabs() {
  const tabs = elLevelTabsContainer.querySelectorAll(".level-tab");
  tabs.forEach((tab) => {
    const lvl = parseInt(tab.getAttribute("data-level"), 10);
    tab.classList.toggle("active", lvl === currentLevel);

    tab.onclick = () => {
      currentLevel = lvl;
      StudyStorage.setLastActive(currentUnitId, currentLevel);
      renderLevelTabs();
      renderMainContent();
    };
  });
}

// ==========================================
// 核心內容渲染器 (Main Content Router)
// ==========================================
function renderMainContent() {
  const currentUnit = UNITS.find((u) => u.id === currentUnitId) || UNITS[0];

  // 注入單元標題
  elUnitHeaderArea.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-size: 2rem;">${currentUnit.icon}</span>
      <div>
        <h1 style="font-size: 1.35rem; font-weight: 700; color: #ffffff;">${currentUnit.name}</h1>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${currentUnit.desc}</p>
      </div>
    </div>
  `;

  if (currentLevel === 0) {
    renderConceptWalkthrough(currentUnitId);
  } else {
    renderPracticeQuestions(currentUnitId, currentLevel);
  }
}

// ==========================================
// Level 0 核心觀念圖解與互動微元件 (Concept Walkthrough)
// ==========================================
function renderConceptWalkthrough(unitId) {
  elContentArea.innerHTML = "";
  const container = document.createElement("div");
  container.className = "walkthrough-container";

  if (unitId === "ch02-descriptive") {
    container.innerHTML = `
      <div class="concept-card">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.6rem;">💡 商業起手式：為什麼算年增率不能用算術平均？</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
          假設一家手搖飲店第一年資本由 100 萬暴賺翻倍為 200 萬（成長率 +100%），第二年經營不善虧損 50% 跌回 100 萬。
          若使用「算術平均數」：(+100% - 50%) / 2 = <strong>+25%</strong>。表面上看似每年大賺 25%，但資本實際上<strong>完全沒增加（淨利為 0）</strong>！
          這正是因為算術平均忽略了前期縮水對後期的複利累乘效應，必定高估實質成長！商業評估跨期成長必須使用<strong>幾何平均數 (CAGR)</strong>。
        </p>

        <div style="background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 10px; border-left: 4px solid #6366f1; margin-bottom: 1.5rem;">
          <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">CAGR 跨期公式拆解</div>
          $$CAGR = \\sqrt[t]{\\frac{V_t}{V_0}} - 1 = \\left( \\frac{V_t}{V_0} \\right)^{\\frac{1}{t}} - 1$$
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.4rem;">
            其中 $V_t$ 為終期數值、$V_0$ 為初期數值、$t$ 為相差跨越期數（112 年 - 108 年 = 4 年）。
          </div>
        </div>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.6rem;">📏 課堂板書唯一標準：百分位數動態尺規 (Percentile Ruler)</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">
          課堂板書 IMG_0130 明確規定位置公式為：<strong>\\(L_x = \\frac{x}{100}(n - 1) + 1\\)</strong>，非整數項採線性內插。
          請試著拖動下方百分比滑桿，觀察位置游標與相鄰整數點內插之動態變化：
        </p>

        <!-- 百分位數互動微元件 -->
        <div class="interactive-widget-box ruler-container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <label style="font-weight: 600; color: #cbd5e1;">目標百分位數 (x)：<span id="rulerPctVal" style="color: #38bdf8; font-family: var(--font-mono); font-size: 1.1rem;">70</span>%</label>
            <input type="range" id="rulerSlider" min="1" max="99" value="70" style="width: 200px; cursor: pointer;">
          </div>

          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            給定排序數列 ($n = 9$)：<code style="color: #a5b4fc;">[10, 15, 18, 24, 30, 36, 42, 50, 60]</code>
          </div>

          <!-- 動態尺規軸 -->
          <div class="ruler-track" id="rulerTrack">
            <!-- 由 JS 動態生成 9 個點 -->
          </div>

          <!-- 即時計算與內插看板 -->
          <div style="background: rgba(30, 41, 59, 0.9); padding: 0.75rem 1rem; border-radius: 8px; font-family: var(--font-mono); font-size: 0.9rem;" id="rulerResultBox">
            <!-- 動態算式 -->
          </div>
        </div>

        <!-- 觀念 Checkpoint -->
        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">🎯 觀念確認 Checkpoint</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
            若樣本資料共有 9 筆，欲求「第 50 百分位數（中位數）」的位置，板書公式算出的位置為何？
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="u1CheckpointOptions">
            <button class="btn btn-secondary" onclick="checkU1Checkpoint(this, false)">A. 4.5</button>
            <button class="btn btn-secondary" onclick="checkU1Checkpoint(this, true)">B. 5.0</button>
            <button class="btn btn-secondary" onclick="checkU1Checkpoint(this, false)">C. 5.5</button>
          </div>
          <div id="u1CheckpointFeedback" style="margin-top: 0.5rem;"></div>
        </div>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
    initPercentileRulerWidget();
  } else if (unitId === "ch02-similarity") {
    container.innerHTML = `
      <div class="concept-card">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.6rem;">🎯 核心心法：拿掉 a！SMC vs Jaccard 雙 0 實驗器</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
          在二元列聯表中，<strong>a 代表「雙 0（兩者皆無）」</strong>，<strong>d 代表「雙 1（兩者皆有）」</strong>。<br>
          在電商購物籃中，任兩位顧客「都沒買」的商品（a）有幾萬種！若用 SMC，海量的雙 0 會把相似度灌水到 0.99，毫無鑑別力！
          因此板書 IMG_0131 特別註記：<strong>「拿掉 a：當 a 這筆資料不重要時，使用雅卡爾指數 (Jaccard)！」</strong>
        </p>

        <!-- 雙 0 動態實驗器 -->
        <div class="interactive-widget-box">
          <div style="font-weight: 700; color: #cbd5e1; margin-bottom: 0.75rem;">🧪 雙 0 膨脹微實驗器</div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
            目前設定：甲乙都買了 2 件 (d=2)，甲買乙未買 2 件 (c=2)，甲未買乙買 1 件 (b=1)。點擊按鈕增加「都沒買 (a)」的數量，觀察兩者變化：
          </p>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="adjustDualZero(5)">a = 5 (小型超市)</button>
            <button class="btn btn-secondary" onclick="adjustDualZero(50)">a = 50 (中型百貨)</button>
            <button class="btn btn-secondary" onclick="adjustDualZero(500)">a = 500 (電商巨頭)</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" id="dualZeroMetrics">
            <!-- 動態注入 SMC 與 Jaccard 對比 -->
          </div>
          <div id="dualZeroExplanation" style="margin-top: 0.75rem; font-size: 0.88rem; color: #a5b4fc; background: rgba(15,23,42,0.7); padding: 0.6rem; border-radius: 6px;">
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">🎯 觀念確認 Checkpoint</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
            下列何種情境「應優先選用 SMC 而非 Jaccard」？
          </p>
          <div style="display: flex; gap: 0.5rem; flex-direction: column;" id="u2CheckpointOptions">
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU2Checkpoint(this, false)">
              A. 串流平台千萬首歌曲之共同收聽紀錄（極為稀疏）
            </button>
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU2Checkpoint(this, true)">
              B. 工廠品質規格檢驗（雙方皆無缺陷『雙 0』代表共同合規，具備高度管理價值）
            </button>
          </div>
          <div id="u2CheckpointFeedback" style="margin-top: 0.5rem;"></div>
        </div>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
    adjustDualZero(5);
  } else if (unitId === "ch06-regression") {
    container.innerHTML = `
      <div class="concept-card">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.6rem;">📈 判定係數 R² 陷阱與板書 IMG_0131 精闢解讀</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
          在多元線性迴歸中，只要隨便多塞入一個自變數，最小平方法 (OLS) 的數學特性保證 <strong>$R^2$ 永遠單調不減</strong>（只會上升或持平）！
          因此板書特別打叉註記：<strong>「$R^2 \\rightarrow$ 模型的解釋能力；資料多，解釋能力不一定上升！」</strong><br>
          為了防止自欺欺人，必須看 <strong>調整後判定係數 ($R^2_{adj}$)</strong>，它會對自變數所消耗的自由度施加懲罰。
        </p>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; margin-bottom: 1.5rem;">
          <h4 style="color: #a5b4fc; margin-bottom: 0.5rem;">板書 P-值判斷門檻速查表</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <tr style="border-bottom: 1px solid var(--border-color); color: #cbd5e1;">
              <th style="padding: 0.5rem; text-align: left;">顯著水準 α</th>
              <th style="padding: 0.5rem; text-align: left;">信心水準</th>
              <th style="padding: 0.5rem; text-align: left;">商務判定解讀</th>
            </tr>
            <tr style="border-bottom: 1px solid rgba(51, 65, 85, 0.4);">
              <td style="padding: 0.5rem; font-family: var(--font-mono); color: #38bdf8;">0.05</td>
              <td style="padding: 0.5rem;">95% (通常標準)</td>
              <td style="padding: 0.5rem; color: #34d399;">p < 0.05 即達統計顯著性</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem; font-family: var(--font-mono); color: #38bdf8;">0.01</td>
              <td style="padding: 0.5rem;">99% (高規格標準)</td>
              <td style="padding: 0.5rem; color: #34d399;">極具顯著性，強烈拒絕 H0</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.6rem;">✖️ 交互作用項 (Interaction Term)：斜率非平行效應</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
          模型：$\\hat{Y} = b_0 + b_1 X_1 + b_2 X_2 + b_3 (X_1 \\cdot X_2)$。<br>
          若 $b_3$ 的 $p$-值小於 $0.05$，代表自變數 $X_1$ 對 $Y$ 的邊際影響力<strong>會隨著 $X_2$ 的多寡而放大或縮小</strong>。在圖形上，不同組別的迴歸線呈現<strong>非平行交叉</strong>！
        </p>

        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">🎯 觀念確認 Checkpoint</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
            若在多元迴歸中任意塞入 5 個與營收無關的自變數，請問 $R^2$ 與 $R^2_{adj}$ 的可能變化為何？
          </p>
          <div style="display: flex; gap: 0.5rem; flex-direction: column;" id="u4CheckpointOptions">
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU4Checkpoint(this, true)">
              A. 原始 R² 上升或不變，但 R²_adj 會懲罰自由度而下跌
            </button>
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU4Checkpoint(this, false)">
              B. 原始 R² 必定大幅下跌，R²_adj 上升
            </button>
          </div>
          <div id="u4CheckpointFeedback" style="margin-top: 0.5rem;"></div>
        </div>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
  } else if (unitId === "ch13-decision") {
    container.innerHTML = `
      <div class="concept-card">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.6rem;">🌳 決策準則心態視覺化 (Decision Criteria Spotlight)</h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
          面對未來不確定情境，四種經典準則體現了四種截然不同的決策哲學。<br>
          請點擊下方按鈕，矩陣會為您打上即時聚焦光圈，呈現演算法挑選方案的過程：
        </p>

        <div class="interactive-widget-box">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <button class="btn btn-primary" onclick="setDecisionSpotlight('maximax')">🌟 樂觀準則 (Maximax)</button>
            <button class="btn btn-secondary" onclick="setDecisionSpotlight('maximin')">🛡️ 悲觀準則 (Maximin)</button>
            <button class="btn btn-secondary" onclick="setDecisionSpotlight('laplace')">⚖️ 機率均等 (Laplace)</button>
            <button class="btn btn-secondary" onclick="setDecisionSpotlight('minimax_regret')">💔 機會損失最小化 (Minimax Regret)</button>
          </div>

          <div id="decisionTableContainer">
            <!-- 動態繪製表格與聚焦光圈 -->
          </div>

          <div id="decisionExplanationBox" style="margin-top: 0.75rem; font-size: 0.9rem; color: #38bdf8; background: rgba(15,23,42,0.8); padding: 0.75rem; border-radius: 8px;">
            <!-- 動態解讀文字 -->
          </div>
        </div>

        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">🎯 觀念確認 Checkpoint</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
            「最大機會損失最小化準則（Minimax Regret）」的本質心態是：
          </p>
          <div style="display: flex; gap: 0.5rem; flex-direction: column;" id="u6CheckpointOptions">
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU6Checkpoint(this, true)">
              A. 避免事後後悔感過大，追求最壞後悔值最小化之折衷方案
            </button>
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU6Checkpoint(this, false)">
              B. 毫無風險意識，只鎖定全場最高利潤孤注一擲
            </button>
          </div>
          <div id="u6CheckpointFeedback" style="margin-top: 0.5rem;"></div>
        </div>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
    setDecisionSpotlight("maximax");
  } else {
    // 單元三或五通用觀念引導
    const isU3 = unitId === "ch03-probability";
    container.innerHTML = `
      <div class="concept-card">
        <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.6rem;">
          ${isU3 ? "🎲 機率法則與貝氏定理倒推" : "📐 線性規劃圖解法與敏感度分析"}
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
          ${
            isU3
              ? "貝氏定理用於藉由新獲得的測試資訊，逆向修正先驗機率為事後後悔（後驗機率）。特別注意：互斥非零必相依！連續型隨機變數單點機率恆為 0。"
              : "線性規劃極值點定理：最佳解必出現在可行解區域的頂點！敏感度分析透過等利潤線斜率夾在相交兩邊界斜率之間，決定係數容許變動範圍。"
          }
        </p>

        <div style="background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 10px; border-left: 4px solid #6366f1; margin-bottom: 1.5rem;">
          <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">核心必考速記</div>
          ${
            isU3
              ? "$$P(A_i|B) = \\frac{P(B|A_i)P(A_i)}{\\sum P(B|A_j)P(A_j)}$$"
              : "$$\\text{Max } Z = c_1 x_1 + c_2 x_2 \\implies m_1 \\le -\\frac{c_1}{c_2} \\le m_2$$"
          }
        </div>

        <button class="btn btn-primary" onclick="switchToLevel1()">
          🚀 理解完畢，直接進入 Level 1 實戰練習！
        </button>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
  }
}

// 觀念 Checkpoint 回饋函式
window.checkU1Checkpoint = function (btn, isCorrect) {
  const fb = document.getElementById("u1CheckpointFeedback");
  if (isCorrect) {
    btn.className = "btn btn-emerald";
    fb.innerHTML = `
      <div style="color: #34d399; font-size: 0.88rem; margin-top: 0.4rem;">
        🎉 完全正確！\\(L_{50} = \\frac{50}{100}(9 - 1) + 1 = 0.5 \\times 8 + 1 = 5.0\\)。整數位置第 5 筆數值恰為 30！
      </div>
      <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="switchToLevel1()">進入 Level 1 實戰練習 →</button>
    `;
  } else {
    btn.className = "btn btn-amber";
    fb.innerHTML = `<div style="color: #fbbf24; font-size: 0.88rem; margin-top: 0.4rem;">注意板書公式是 (n-1)+1，非 (n+1) 或 n！(9-1)=8，0.5*8+1=5.0。</div>`;
  }
  renderMath(fb);
};

window.checkU2Checkpoint = function (btn, isCorrect) {
  const fb = document.getElementById("u2CheckpointFeedback");
  if (isCorrect) {
    btn.className = "btn btn-emerald";
    fb.innerHTML = `
      <div style="color: #34d399; font-size: 0.88rem; margin-top: 0.4rem;">
        🎉 觀念極度透徹！當「雙 0」具備重要管理意涵（如共同合規），SMC 才是正確指標！
      </div>
      <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="switchToLevel1()">進入 Level 1 實戰練習 →</button>
    `;
  } else {
    btn.className = "btn btn-amber";
    fb.innerHTML = `<div style="color: #fbbf24; font-size: 0.88rem; margin-top: 0.4rem;">稀疏資料中雙 0 不重要時才用 Jaccard！當雙 0 代表共同合格時，必須用 SMC。</div>`;
  }
};

window.checkU4Checkpoint = function (btn, isCorrect) {
  const fb = document.getElementById("u4CheckpointFeedback");
  if (isCorrect) {
    btn.className = "btn btn-emerald";
    fb.innerHTML = `
      <div style="color: #34d399; font-size: 0.88rem; margin-top: 0.4rem;">
        🎉 正確！板書強調 R² 單調不減，自由度被浪費時只有 R²_adj 會下跌！
      </div>
      <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="switchToLevel1()">進入 Level 1 實戰練習 →</button>
    `;
  } else {
    btn.className = "btn btn-amber";
    fb.innerHTML = `<div style="color: #fbbf24; font-size: 0.88rem; margin-top: 0.4rem;">最小平方法保證原始 R² 絕不可能下跌！</div>`;
  }
};

window.checkU6Checkpoint = function (btn, isCorrect) {
  const fb = document.getElementById("u6CheckpointFeedback");
  if (isCorrect) {
    btn.className = "btn btn-emerald";
    fb.innerHTML = `
      <div style="color: #34d399; font-size: 0.88rem; margin-top: 0.4rem;">
        🎉 答對了！事後後悔感最小化，先找各方案最壞後悔，再選衝擊最小者。
      </div>
      <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="switchToLevel1()">進入 Level 1 實戰練習 →</button>
    `;
  } else {
    btn.className = "btn btn-amber";
    fb.innerHTML = `<div style="color: #fbbf24; font-size: 0.88rem; margin-top: 0.4rem;">孤注一擲只看最高利潤的是樂觀準則 (Maximax)。</div>`;
  }
};

window.switchToLevel1 = function () {
  currentLevel = 1;
  StudyStorage.setLastActive(currentUnitId, 1);
  renderLevelTabs();
  renderMainContent();
};

// 百分位數動態尺規微元件驅動
function initPercentileRulerWidget() {
  const data = [10, 15, 18, 24, 30, 36, 42, 50, 60];
  const n = data.length;
  const slider = document.getElementById("rulerSlider");
  const track = document.getElementById("rulerTrack");
  const pctVal = document.getElementById("rulerPctVal");
  const resBox = document.getElementById("rulerResultBox");

  function update() {
    const x = parseInt(slider.value, 10);
    pctVal.textContent = x;

    const L = (x / 100) * (n - 1) + 1;
    const p = Math.floor(L);
    const d = L - p;
    const x_p = data[p - 1];
    const x_p1 = p < n ? data[p] : data[n - 1];
    const interpVal = Math.round((x_p + d * (x_p1 - x_p)) * 100) / 100;

    // 重新繪製軌道上的點
    track.innerHTML = "";
    data.forEach((val, idx) => {
      const posIdx = idx + 1;
      const isNeighbor = posIdx === p || (d > 0 && posIdx === p + 1);

      const pt = document.createElement("div");
      pt.className = "ruler-point";
      pt.innerHTML = `
        <div class="ruler-dot ${isNeighbor ? "active-neighbor" : ""}"></div>
        <div class="ruler-label">${val}</div>
        <div style="font-size: 0.65rem; color: #64748b;">X${posIdx}</div>
      `;
      track.appendChild(pt);
    });

    // 游標位置 (1 ~ 9 映射到 0% ~ 100%)
    const pctPos = ((L - 1) / (n - 1)) * 100;
    const cursor = document.createElement("div");
    cursor.className = "ruler-cursor-line";
    cursor.style.left = `calc(${pctPos}% + 1rem - (${pctPos * 0.32}px))`;
    cursor.innerHTML = `
      <div class="ruler-cursor-tag">L${x} = ${L.toFixed(2)}</div>
    `;
    track.appendChild(cursor);

    resBox.innerHTML = `
      <div style="color: #38bdf8; margin-bottom: 0.3rem;">板書位置推導：L_${x} = (${x}/100) * (9 - 1) + 1 = <strong>${L.toFixed(2)}</strong></div>
      <div style="color: #cbd5e1;">整數項 p = ${p} (X${p} = ${x_p})，小數項 0.d = ${d.toFixed(2)} (X${p < n ? p+1 : p} = ${x_p1})</div>
      <div style="color: #34d399; font-weight: 700; margin-top: 0.3rem;">
        線性內插數值：P_${x} = ${x_p} + ${d.toFixed(2)} * (${x_p1} - ${x_p}) = <strong>${interpVal}</strong>
      </div>
    `;
  }

  slider.oninput = update;
  update();
}

// 雙 0 實驗器驅動
window.adjustDualZero = function (a) {
  const b = 1, c = 2, d = 2;
  const N = a + b + c + d;
  const smc = ((a + d) / N).toFixed(4);
  const jaccard = (d / (b + c + d)).toFixed(4);

  const container = document.getElementById("dualZeroMetrics");
  const exp = document.getElementById("dualZeroExplanation");
  if (!container) return;

  container.innerHTML = `
    <div style="background: rgba(30, 41, 59, 0.9); border: 1.5px solid ${a >= 50 ? '#f43f5e' : '#6366f1'}; border-radius: 8px; padding: 0.75rem;">
      <div style="font-size: 0.8rem; color: #94a3b8;">簡單匹配係數 (SMC)</div>
      <div style="font-size: 1.3rem; font-family: var(--font-mono); font-weight: 700; color: ${a >= 50 ? '#f43f5e' : '#38bdf8'};">
        ${smc}
      </div>
      <div style="font-size: 0.75rem; color: #64748b;">(a+d)/N = (${a}+2)/${N}</div>
    </div>
    <div style="background: rgba(30, 41, 59, 0.9); border: 1.5px solid #10b981; border-radius: 8px; padding: 0.75rem;">
      <div style="font-size: 0.8rem; color: #94a3b8;">雅卡爾指數 (Jaccard)</div>
      <div style="font-size: 1.3rem; font-family: var(--font-mono); font-weight: 700; color: #34d399;">
        ${jaccard}
      </div>
      <div style="font-size: 0.75rem; color: #64748b;">d/(b+c+d) = 2/(1+2+2) [排除 a]</div>
    </div>
  `;

  if (a >= 50) {
    exp.innerHTML = `
      🚨 <strong>極端現象顯現</strong>：當沒買商品數 a 膨脹至 ${a} 時，SMC 已經被灌水飆高至 <strong>${smc}</strong>（失去任何區分價值）！
      而 Jaccard 指數依然<strong>定格在 0.4000</strong>，忠實反映出兩人在感興趣商品上的實質交集只有 40%！這就是板書強調「拿掉 a」的精髓！
    `;
  } else {
    exp.innerHTML = `
      當 a = ${a} 時，SMC 為 ${smc}，Jaccard 為 ${jaccard}。嘗試點擊上方切換為 a = 50 或 500！
    `;
  }
};

// 決策準則心態視覺化驅動
window.setDecisionSpotlight = function (mode) {
  const tableBox = document.getElementById("decisionTableContainer");
  const expBox = document.getElementById("decisionExplanationBox");
  if (!tableBox) return;

  const rawMatrix = [
    { name: "方案 A", s1: 100, s2: 40, s3: -20 },
    { name: "方案 B", s1: 70, s2: 50, s3: 10 },
    { name: "方案 C", s1: 50, s2: 50, s3: 40 }
  ];

  if (mode === "maximax") {
    tableBox.innerHTML = `
      <table class="decision-table">
        <tr><th>方案 \\ 景氣</th><th>繁榮 (S1)</th><th>平平 (S2)</th><th>蕭條 (S3)</th><th>方案最大值</th></tr>
        <tr><td>方案 A</td><td class="cell-winner">100</td><td>40</td><td>-20</td><td class="cell-winner">100 (全場最高)</td></tr>
        <tr><td>方案 B</td><td class="cell-spotlight">70</td><td>50</td><td>10</td><td>70</td></tr>
        <tr><td>方案 C</td><td class="cell-spotlight">50</td><td>50</td><td>40</td><td>50</td></tr>
      </table>
    `;
    expBox.innerHTML = "🌟 <strong>樂觀準則 (Maxi-max)</strong>：各列先找最大獲利（A:100, B:70, C:50），再從中挑選全場最高者 $\\implies$ <strong>選方案 A（100 萬）</strong>！";
  } else if (mode === "maximin") {
    tableBox.innerHTML = `
      <table class="decision-table">
        <tr><th>方案 \\ 景氣</th><th>繁榮 (S1)</th><th>平平 (S2)</th><th>蕭條 (S3)</th><th>最差保底獲利</th></tr>
        <tr><td>方案 A</td><td>100</td><td>40</td><td class="cell-spotlight">-20</td><td>-20</td></tr>
        <tr><td>方案 B</td><td>70</td><td>50</td><td class="cell-spotlight">10</td><td>10</td></tr>
        <tr><td>方案 C</td><td>50</td><td>50</td><td class="cell-winner">40</td><td class="cell-winner">40 (最差中最好)</td></tr>
      </table>
    `;
    expBox.innerHTML = "🛡️ <strong>悲觀準則 (Maxi-min)</strong>：各列先找最壞結果（A:-20, B:10, C:40），從最差中挑相對最好的保守保底 $\\implies$ <strong>選方案 C（40 萬）</strong>！";
  } else if (mode === "laplace") {
    tableBox.innerHTML = `
      <table class="decision-table">
        <tr><th>方案 \\ 景氣</th><th>繁榮 (S1)</th><th>平平 (S2)</th><th>蕭條 (S3)</th><th>算術平均獲利</th></tr>
        <tr><td>方案 A</td><td>100</td><td>40</td><td>-20</td><td>40.0</td></tr>
        <tr><td>方案 B</td><td>70</td><td>50</td><td>10</td><td>43.33</td></tr>
        <tr><td>方案 C</td><td>50</td><td>50</td><td>40</td><td class="cell-winner">46.67 (平均最高)</td></tr>
      </table>
    `;
    expBox.innerHTML = "⚖️ <strong>機率均等準則 (Laplace)</strong>：假設三種景氣機率各 1/3，求期望獲利 $\\implies$ <strong>選方案 C（平均 46.67 萬最高）</strong>！";
  } else if (mode === "minimax_regret") {
    tableBox.innerHTML = `
      <table class="decision-table">
        <tr><th>機會損失矩陣 (遺憾值)</th><th>S1 (基基準100)</th><th>S2 (基準50)</th><th>S3 (基準40)</th><th>方案最大遺憾</th></tr>
        <tr><td>方案 A</td><td>0</td><td>10</td><td class="cell-spotlight">60</td><td>60</td></tr>
        <tr><td>方案 B</td><td class="cell-spotlight">30</td><td>0</td><td class="cell-spotlight">30</td><td>30</td></tr>
        <tr><td>方案 C</td><td class="cell-winner">50</td><td>0</td><td>0</td><td class="cell-winner">50</td></tr>
      </table>
    `;
    expBox.innerHTML = "💔 <strong>最大機會損失最小化 (Minimax Regret)</strong>：行最大減各格算遺憾值。各方案最大遺憾 A:60, B:30, C:50。取最小遺憾 30 $\\implies$ <strong>選方案 B（最壞遺憾僅 30 萬）</strong>！";
  }
};

// ==========================================
// Level 1 ~ 4 實戰刷題核心渲染器
// ==========================================
function renderPracticeQuestions(unitId, level) {
  elContentArea.innerHTML = "";

  // 篩選題目
  let filtered = RAW_QUESTIONS.filter((q) => q.unit === unitId && q.level === level);

  // 弱點清剿模式過濾
  if (isWeaknessMode) {
    filtered = filtered.filter((q) => {
      const state = StudyStorage.getQuestionState(q.id);
      return state.status === "review_needed";
    });
  }

  if (filtered.length === 0) {
    elContentArea.innerHTML = `
      <div style="background: var(--bg-card); border: 1px dashed var(--border-light); border-radius: 16px; padding: 3rem 1.5rem; text-align: center;">
        <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">${isWeaknessMode ? "🎉" : "📝"}</span>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">
          ${isWeaknessMode ? "恭喜！本單元本階梯已無標記為 🟡 需加強的題目！" : "此階梯尚無題目"}
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.25rem;">
          ${isWeaknessMode ? "點擊右上角退出弱點模式，或前往下一階梯挑戰！" : "請切換至其他 Level 階梯繼續作答。"}
        </p>
        ${
          isWeaknessMode
            ? `<button class="btn btn-secondary" onclick="document.getElementById('btnWeaknessMode').click()">退出弱點模式</button>`
            : ""
        }
      </div>
    `;
    return;
  }

  // 渲染每道題目
  filtered.forEach((q, index) => {
    // 檢查是否有動態生成暫存
    const displayQ = dynamicQuestionCache[q.id] || q;
    const card = createQuestionCard(displayQ, q, index + 1);
    elContentArea.appendChild(card);
    renderMath(card);
  });
}

function createQuestionCard(q, originalQ, indexNum) {
  const qState = StudyStorage.getQuestionState(originalQ.id);

  const card = document.createElement("div");
  card.className = "question-card";
  card.id = `card-${originalQ.id}`;

  // 標籤樣式
  let statusBadgeClass = "badge-unattempted";
  let statusBadgeText = "⚪ 未作答";
  if (qState.status === "mastered") {
    statusBadgeClass = "badge-mastered";
    statusBadgeText = "🟢 已精通";
  } else if (qState.status === "review_needed") {
    statusBadgeClass = "badge-review";
    statusBadgeText = "🟡 需加強";
  }

  // 頂部列
  const headerHtml = `
    <div class="question-header">
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <span class="badge badge-level">Level ${q.level}</span>
        <span class="badge ${statusBadgeClass}" id="badge-${originalQ.id}">${statusBadgeText}</span>
        <h3 style="font-size: 1.1rem; font-weight: 700; color: #ffffff;">#${indexNum}. ${q.title}</h3>
      </div>
      <button class="bookmark-btn ${qState.isBookmarked ? "bookmarked" : ""}" title="考前重點標記" onclick="toggleCardBookmark('${originalQ.id}')">
        ★
      </button>
    </div>
  `;

  // 手算已知數據卡片 (Given Data Card)
  let givenDataHtml = "";
  if (q.givenData) {
    const items = Object.entries(q.givenData)
      .map(
        ([k, v]) => `
        <div class="given-data-badge">
          <div class="given-data-key">${k}</div>
          <div class="given-data-value">${v}</div>
        </div>
      `
      )
      .join("");
    givenDataHtml = `
      <div class="given-data-card">
        <div class="given-data-title">📋 題目已知參數 (Given Data)</div>
        <div class="given-data-grid">${items}</div>
      </div>
    `;
  }

  // 題目敘述
  const promptHtml = `
    <div style="font-size: 1rem; color: #e2e8f0; line-height: 1.7; margin: 1rem 0; white-space: pre-line;">
      ${q.questionPrompt}
    </div>
  `;

  // 作答區主體 (MCQ vs Numeric vs Self-check)
  let interactiveHtml = "";

  if (q.type === "mcq") {
    // 選項洗牌 (動態洗牌防死背)
    const options = [...q.options];
    // 使用題目 id 搭配固定偽隨機確保作答間不狂跳，但重新整理時可隨機
    interactiveHtml = `
      <div class="options-container" id="options-${originalQ.id}">
        ${options
          .map((opt) => {
            const isSelected = qState.lastSelected === opt.key;
            let optClass = "option-btn";
            if (isSelected) {
              optClass += opt.key === q.correctAnswer ? " selected-correct" : " selected-wrong";
            }
            return `
              <div>
                <button class="${optClass}" onclick="handleMcqSelect('${originalQ.id}', '${opt.key}')">
                  <span class="option-key">${opt.key}</span>
                  <span style="flex: 1;">${opt.text}</span>
                </button>
                <div id="distractor-${originalQ.id}-${opt.key}" style="display: ${isSelected && opt.distractorFeedback ? "block" : "none"};">
                  ${opt.distractorFeedback ? `<div class="distractor-feedback">⚠️ 觀念剖析：${opt.distractorFeedback}</div>` : ""}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  } else if (q.type === "numeric") {
    interactiveHtml = `
      <div style="margin: 1.25rem 0;">
        <div class="numeric-input-wrapper">
          <input type="text" class="numeric-input" id="input-${originalQ.id}" placeholder="請輸入手算數值 (例: 50 或 39.6)..." value="${qState.lastSelected || ""}" onkeydown="if(event.key==='Enter') submitNumericAnswer('${originalQ.id}')">
          <span style="font-weight: 700; color: #a5b4fc; font-size: 1.1rem;">${q.unitLabel || ""}</span>
          <button class="btn btn-primary" onclick="submitNumericAnswer('${originalQ.id}')">送出答案</button>
          <button class="btn btn-amber" onclick="peekFormulaHint('${originalQ.id}')" title="查看公式（掌握度會標記為🟡需加強）">💡 提示公式</button>
          ${
            originalQ.hasDynamicGenerator
              ? `<button class="btn btn-secondary" onclick="randomizeCardParam('${originalQ.id}', '${originalQ.dynamicType}')" title="防死背：重新換一組數字算算看">🎲 換一組數字</button>`
              : ""
          }
        </div>

        <!-- 通用符號晶片工具列 (Universal Symbol Palette) -->
        <div class="symbol-palette">
          <span style="font-size: 0.75rem; color: #94a3b8; width: 100%; margin-bottom: 0.2rem;">通用符號快捷鍵（點擊填入）：</span>
          ${["≤", "≥", "=", "<", ">", "/", "c1", "c2", "x1", "x2", "0", "1", "2", "4/3", "3/5", "+", "-", "*"]
            .map(
              (sym) =>
                `<button class="symbol-chip" onclick="insertSymbolToInput('${originalQ.id}', '${sym}')">${sym}</button>`
            )
            .join("")}
        </div>

        <!-- 提示公式展開盒 -->
        <div id="hint-box-${originalQ.id}" style="display: ${qState.hintViewed ? "block" : "none"}; margin: 0.75rem 0; padding: 0.75rem 1rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px;">
          <div style="font-weight: 700; color: #fbbf24; font-size: 0.85rem; margin-bottom: 0.3rem;">💡 公式引導（已標記為 🟡 需加強）：</div>
          <div>$$${q.formulaHint}$$</div>
        </div>

        <!-- 即時核對回饋 -->
        <div id="numeric-feedback-${originalQ.id}" style="margin-top: 0.5rem;"></div>
      </div>
    `;
  } else if (q.type === "self-check") {
    // Level 3/4 平板紙筆自評卡片
    interactiveHtml = `
      <div style="margin: 1.5rem 0; background: rgba(15, 23, 42, 0.6); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-weight: 700; color: #a5b4fc;">✍️ 紙筆手算對答案 (Self-Check Card)</span>
          <button class="btn btn-secondary" onclick="toggleSolutionBox('${originalQ.id}')">
            🔍 展開 / 摺疊分步推導
          </button>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem;">
          請先在手邊白紙或計算機上完整推導出答案，推導完畢後點擊展開解析，並依真實情況點選自評：
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn btn-emerald" style="flex: 1;" onclick="markSelfCheck('${originalQ.id}', 'mastered')">
            🟢 我自己算對了！(精通)
          </button>
          <button class="btn btn-amber" style="flex: 1;" onclick="markSelfCheck('${originalQ.id}', 'review_needed')">
            🟡 算錯了 / 需看解析 (需加強)
          </button>
        </div>
      </div>
    `;
  }

  // 完整分步詳解面板 (Step-by-step full solution)
  const isAnswered = qState.status !== "unattempted";
  const solutionHtml = `
    <div class="solution-panel" id="solution-${originalQ.id}" style="display: ${isAnswered ? "block" : "none"};">
      <div class="solution-header">
        <span>📖 完整分步解答與破題心法</span>
      </div>
      <div style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.8; white-space: pre-line;">
        ${q.fullSolution}
      </div>
    </div>
  `;

  card.innerHTML = headerHtml + givenDataHtml + promptHtml + interactiveHtml + solutionHtml;
  return card;
}

// ==========================================
// 作答邏輯與狀態更新
// ==========================================

// 選擇題作答
window.handleMcqSelect = function (qId, selectedKey) {
  const originalQ = RAW_QUESTIONS.find((q) => q.id === qId);
  if (!originalQ) return;

  const isCorrect = selectedKey === originalQ.correctAnswer;
  const currentSt = StudyStorage.getQuestionState(qId);

  // 初次答對計為 mastered，否則計為 review_needed
  let newStatus = "review_needed";
  if (isCorrect && currentSt.userAttempts === 0 && !currentSt.hintViewed) {
    newStatus = "mastered";
  }

  StudyStorage.updateQuestionState(qId, {
    status: newStatus,
    lastSelected: selectedKey,
    userAttempts: currentSt.userAttempts + 1
  });

  // 更新當前卡片 DOM
  const card = document.getElementById(`card-${qId}`);
  if (card) {
    const opts = card.querySelectorAll(".option-btn");
    opts.forEach((btn) => {
      const key = btn.querySelector(".option-key").textContent.trim();
      btn.className = "option-btn";
      if (key === selectedKey) {
        btn.classList.add(isCorrect ? "selected-correct" : "selected-wrong");
      }
      const distractorEl = document.getElementById(`distractor-${qId}-${key}`);
      if (distractorEl) {
        distractorEl.style.display = key === selectedKey && !isCorrect ? "block" : "none";
      }
    });

    // 展開詳解
    const solPanel = document.getElementById(`solution-${qId}`);
    if (solPanel) solPanel.style.display = "block";

    // 更新 Badge
    const badge = document.getElementById(`badge-${qId}`);
    if (badge) {
      badge.className = `badge ${newStatus === "mastered" ? "badge-mastered" : "badge-review"}`;
      badge.textContent = newStatus === "mastered" ? "🟢 已精通" : "🟡 需加強";
    }
  }

  updateProgressUI();
};

// 數值題作答
window.submitNumericAnswer = function (qId) {
  const originalQ = RAW_QUESTIONS.find((q) => q.id === qId);
  const q = dynamicQuestionCache[qId] || originalQ;
  if (!q) return;

  const inputEl = document.getElementById(`input-${qId}`);
  const feedbackEl = document.getElementById(`numeric-feedback-${qId}`);
  const solPanel = document.getElementById(`solution-${qId}`);
  if (!inputEl) return;

  const rawVal = inputEl.value.trim();
  if (!rawVal) {
    alert("請輸入數值後再送出！");
    return;
  }

  // 支援分數格式輸入 (例如 14/15)
  let userNum = NaN;
  if (rawVal.includes("/")) {
    const parts = rawVal.split("/");
    if (parts.length === 2) {
      userNum = parseFloat(parts[0]) / parseFloat(parts[1]);
    }
  } else {
    userNum = parseFloat(rawVal);
  }

  if (isNaN(userNum)) {
    feedbackEl.innerHTML = `<div style="color: #f43f5e; font-size: 0.88rem;">請輸入合法的數字格式！</div>`;
    return;
  }

  const tol = q.tolerance !== null && q.tolerance !== undefined ? q.tolerance : 0.05;
  const isCorrect = Math.abs(userNum - q.correctAnswer) <= tol;

  const currentSt = StudyStorage.getQuestionState(qId);
  let newStatus = "review_needed";
  if (isCorrect && !currentSt.hintViewed && currentSt.userAttempts === 0) {
    newStatus = "mastered";
  }

  StudyStorage.updateQuestionState(qId, {
    status: newStatus,
    lastSelected: rawVal,
    userAttempts: currentSt.userAttempts + 1
  });

  if (isCorrect) {
    feedbackEl.innerHTML = `
      <div style="color: #34d399; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
        <span>🎉 正確！</span>
        <span style="font-weight: normal; font-size: 0.85rem; color: #cbd5e1;">手算精準命中答案 ${q.correctAnswer} ${q.unitLabel || ""}</span>
      </div>
    `;
  } else {
    feedbackEl.innerHTML = `
      <div style="color: #fbbf24; font-weight: 700; font-size: 0.95rem;">
        ❌ 計算有落差！參考正確數值約為 ${q.correctAnswer} ${q.unitLabel || ""}，請檢查下方逐步解析。
      </div>
    `;
  }

  if (solPanel) solPanel.style.display = "block";

  const badge = document.getElementById(`badge-${qId}`);
  if (badge) {
    badge.className = `badge ${newStatus === "mastered" ? "badge-mastered" : "badge-review"}`;
    badge.textContent = newStatus === "mastered" ? "🟢 已精通" : "🟡 需加強";
  }

  updateProgressUI();
};

// 提示公式按鈕 (Peek Formula)
window.peekFormulaHint = function (qId) {
  const hintBox = document.getElementById(`hint-box-${qId}`);
  if (hintBox) {
    hintBox.style.display = "block";
    renderMath(hintBox);
  }

  // 偷看公式自動降為 🟡
  StudyStorage.updateQuestionState(qId, {
    status: "review_needed",
    hintViewed: true
  });

  const badge = document.getElementById(`badge-${qId}`);
  if (badge) {
    badge.className = "badge badge-review";
    badge.textContent = "🟡 需加強";
  }

  updateProgressUI();
};

// 符號晶片填入
window.insertSymbolToInput = function (qId, symbol) {
  const inputEl = document.getElementById(`input-${qId}`);
  if (inputEl) {
    inputEl.value += symbol;
    inputEl.focus();
  }
};

// 換一組數字 (動態隨機題)
window.randomizeCardParam = function (qId, dynamicType) {
  const dynamicQ = generateDynamicQuestion(dynamicType);
  if (!dynamicQ) return;

  const originalQ = RAW_QUESTIONS.find((q) => q.id === qId);
  const merged = { ...originalQ, ...dynamicQ };
  dynamicQuestionCache[qId] = merged;

  // 重置作答狀態與輸入框
  StudyStorage.updateQuestionState(qId, {
    lastSelected: null,
    hintViewed: false
  });

  // 局部重新繪製卡片
  const oldCard = document.getElementById(`card-${qId}`);
  if (oldCard) {
    const newCard = createQuestionCard(merged, originalQ, 1);
    oldCard.replaceWith(newCard);
    renderMath(newCard);
  }
};

// 自評打分 (Level 3/4)
window.markSelfCheck = function (qId, status) {
  StudyStorage.updateQuestionState(qId, { status });

  const badge = document.getElementById(`badge-${qId}`);
  if (badge) {
    badge.className = `badge ${status === "mastered" ? "badge-mastered" : "badge-review"}`;
    badge.textContent = status === "mastered" ? "🟢 已精通" : "🟡 需加強";
  }

  const solPanel = document.getElementById(`solution-${qId}`);
  if (solPanel) solPanel.style.display = "block";

  updateProgressUI();
};

window.toggleSolutionBox = function (qId) {
  const solPanel = document.getElementById(`solution-${qId}`);
  if (solPanel) {
    solPanel.style.display = solPanel.style.display === "none" ? "block" : "none";
  }
};

// 書籤標記
window.toggleCardBookmark = function (qId) {
  const updated = StudyStorage.toggleBookmark(qId);
  const card = document.getElementById(`card-${qId}`);
  if (card) {
    const btn = card.querySelector(".bookmark-btn");
    if (btn) btn.classList.toggle("bookmarked", updated.isBookmarked);
  }
};

// ==========================================
// 考前 30 分鐘救急包與戰力儀表板渲染
// ==========================================
function renderCramModal() {
  const body = document.getElementById("cramModalBody");
  const reviewQuestions = RAW_QUESTIONS.filter((q) => {
    const st = StudyStorage.getQuestionState(q.id);
    return st.status === "review_needed" || st.isBookmarked;
  });

  if (reviewQuestions.length === 0) {
    body.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #10b981;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🎉</span>
        <h4 style="font-size: 1.15rem; font-weight: 700;">目前沒有標記為 🟡（需加強）或 ★ 書籤的題目！</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.4rem;">
          代表您的所有練習皆順利掌握，考前狀態極佳！若有不熟題目，可點擊題目星星或查看公式進行標記。
        </p>
      </div>
    `;
    return;
  }

  body.innerHTML = reviewQuestions
    .map(
      (q) => `
    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(245, 158, 11, 0.4); border-left: 4px solid #f59e0b; border-radius: 10px; padding: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
        <span style="font-weight: 700; color: #fbbf24; font-size: 0.95rem;">${q.cramSummary.conceptName}</span>
        <span class="badge badge-level">Level ${q.level}</span>
      </div>
      <div style="font-size: 0.9rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 0.5rem;">
        🔑 <strong>速記口訣：</strong>${q.cramSummary.keyTakeaway}
      </div>
      <div style="background: rgba(30, 41, 59, 0.8); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.88rem;">
        $$${q.formulaHint}$$
      </div>
    </div>
  `
    )
    .join("");

  renderMath(body);
}

function renderDashboardModal() {
  const body = document.getElementById("dashboardModalBody");
  const stats = StudyStorage.calculateStats(RAW_QUESTIONS);

  const unitRows = UNITS.map((u) => {
    const s = stats.unitStats[u.id] || { total: 0, mastered: 0, reviewNeeded: 0, unattempted: 0 };
    const pct = s.total > 0 ? Math.round((s.mastered / s.total) * 100) : 0;
    return `
      <div style="margin-bottom: 0.85rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
          <span style="color: #cbd5e1; font-weight: 600;">${u.icon} ${u.shortName}</span>
          <span style="font-family: var(--font-mono); color: ${pct === 100 ? "#10b981" : "#38bdf8"}; font-weight: 700;">${pct}% (${s.mastered}/${s.total})</span>
        </div>
        <div class="unit-progress-container" style="height: 8px;">
          <div class="unit-progress-bar" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join("");

  const conceptPct = stats.typeStats.concept.total > 0
    ? Math.round((stats.typeStats.concept.mastered / stats.typeStats.concept.total) * 100)
    : 0;
  const calcPct = stats.typeStats.calc.total > 0
    ? Math.round((stats.typeStats.calc.mastered / stats.typeStats.calc.total) * 100)
    : 0;

  body.innerHTML = `
    <!-- 全域指標圓環 / 大卡 -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.9rem; text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">全域精通率</div>
        <div style="font-size: 1.6rem; font-family: var(--font-mono); font-weight: 800; color: #10b981;">${stats.overallMasteryPct}%</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.9rem; text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">觀念選擇勝率</div>
        <div style="font-size: 1.6rem; font-family: var(--font-mono); font-weight: 800; color: #38bdf8;">${conceptPct}%</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.9rem; text-align: center;">
        <div style="font-size: 0.75rem; color: var(--text-secondary);">手算實戰正確率</div>
        <div style="font-size: 1.6rem; font-family: var(--font-mono); font-weight: 800; color: #a5b4fc;">${calcPct}%</div>
      </div>
    </div>

    <!-- 6 大單元掌握度條狀圖 -->
    <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 1rem;">📊 6 大單元掌握度診斷</h4>
      ${unitRows}
    </div>

    <!-- 資料匯出與備份匯入 -->
    <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem;">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 0.75rem;">💾 學習紀錄備份與跨裝置同步 (JSON)</h4>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-primary" style="flex: 1;" onclick="StudyStorage.exportBackup()">
          匯出進度 JSON
        </button>
        <label class="btn btn-secondary" style="flex: 1; cursor: pointer; text-align: center;">
          匯入備份檔
          <input type="file" id="dashboardImportInput" accept=".json" style="display: none;" onchange="handleFileImport(this)">
        </label>
      </div>
    </div>
  `;
}

window.handleFileImport = function (input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const res = StudyStorage.importBackup(e.target.result);
    if (res.success) {
      alert("學習紀錄已成功匯入！");
      dynamicQuestionCache = {};
      renderSidebarUnits();
      updateProgressUI();
      renderMainContent();
      renderDashboardModal();
    } else {
      alert("匯入失敗：" + res.error);
    }
  };
  reader.readAsText(file);
};
