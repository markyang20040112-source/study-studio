/**
 * 商業分析 (BA) 互動複習系統 - 核心前端應用程式
 * 純原生 JavaScript SPA，支援離線執行、零外部建置相依
 */

// 全域狀態
let currentUnitId = "ch02-descriptive";
let currentLevel = 0;
let isWeaknessMode = false;
let dynamicQuestionCache = {}; // 暫存動態隨機題
let mcqOptionShuffledCache = {}; // 暫存打散後的選項（防死背）

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
let isKaTeXPending = false;
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
  } else if (!isKaTeXPending) {
    isKaTeXPending = true;
    const retry = (attempts = 0) => {
      if (window.renderMathInElement) {
        isKaTeXPending = false;
        if (elContentArea) renderMath(elContentArea);
      } else if (attempts < 20) {
        setTimeout(() => retry(attempts + 1), 150);
      }
    };
    window.addEventListener("load", () => retry(0));
    setTimeout(() => retry(0), 200);
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
      mcqOptionShuffledCache = {};
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
      <!-- Card 1: 集中趨勢指標與極端值陷阱 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">💡 集中趨勢指標 (Central Tendency) & 極端值受害實例</span>
          <span class="badge badge-mastered">核心必考</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          在敘述統計中，「平均數」並非萬能。當樣本中出現少數超大或超小數值時，算術平均數會被強烈拉扯，徹底失去對母體中央代表性！
        </p>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">算術平均數 (Arithmetic Mean)</div>
            $$\\bar{X} = \\frac{1}{n} \\sum_{i=1}^n X_i$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              優點為計算納入每一筆數據，但<strong>致命缺點：對極端值極度敏感（極易受拉扯）</strong>！
            </div>
          </div>
          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">中位數 (Median) 與眾數 (Mode)</div>
            $$\\text{Median} = \\text{排序後第 } 50 \\text{ 百分位數 (Q2)}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              中位數僅依賴位置排序，<strong>具抗極端值穩健性 (Robustness)</strong>；眾數為出現頻率最高者。
            </div>
          </div>
        </div>

        <div class="callout-box callout-rose">
          <div style="font-weight: 700; margin-bottom: 0.4rem;">🚨 極端值拉扯震撼實例：5 位員工與空降 CEO 的薪資陷阱</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">
            某新創公司原本 5 位基層工程師的月薪為：<code style="color: #f43f5e;">[38k, 40k, 42k, 45k, 45k]</code>。<br>
            此時：<strong>算術平均數 = 42k</strong>，<strong>中位數 = 42k</strong>（兩者完美吻合，極具代表性）。
          </p>
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">
            隔月空降一位百萬月薪 CEO（月薪 <strong style="color: #f43f5e;">1,000k</strong>），資料變為：<code style="color: #f43f5e;">[38k, 40k, 42k, 45k, 45k, 1000k]</code>：
          </p>
          <ul style="padding-left: 1.25rem; font-size: 0.88rem; line-height: 1.6;">
            <li>算術平均數瞬間暴增至：<strong>201.7k</strong>！（全公司 83% 的員工薪資都遠低於平均數，平均數已淪為欺騙求職者的假象！）</li>
            <li>中位數僅微幅移動至：<strong>43.5k</strong>！（忠實反映真實員工的水準，不受百萬 CEO 影響）。</li>
          </ul>
        </div>

        <div class="callout-box callout-amber">
          <div style="font-weight: 700; margin-bottom: 0.3rem;">📌 分佈偏態與指標位置定律（考場必背心法）</div>
          <ul style="padding-left: 1.25rem; font-size: 0.88rem; line-height: 1.6;">
            <li><strong>右偏分佈 (正偏態，長尾在右側極大值)</strong>：$\\text{Mean} > \\text{Median} > \\text{Mode}$（極大值把平均數往右拉高）</li>
            <li><strong>對稱常態分佈</strong>：$\\text{Mean} = \\text{Median} = \\text{Mode}$（三者完全重疊）</li>
            <li><strong>左偏分佈 (負偏態，長尾在左側極小值)</strong>：$\\text{Mean} < \\text{Median} < \\text{Mode}$（極小值把平均數往左拉低）</li>
          </ul>
        </div>
      </div>

      <!-- Card 2: 複合年均成長率 CAGR -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">📈 複合年均成長率 (CAGR) vs 算術平均高估陷阱</span>
          <span class="badge badge-mastered">商務核心</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          假設一家連鎖手搖飲店第一年資本由 100 萬暴賺翻倍為 200 萬（成長率 +100%），第二年經營不善虧損 50% 跌回 100 萬。<br>
          若使用「算術平均數」：$(+100\\% - 50\\%) / 2 = \\mathbf{+25\\%}$。表面上看似每年大賺 25%，但資本實際上<strong>完全沒增加（實質獲利為 0）</strong>！<br>
          因為算術平均忽略了前期本金縮水對後期的複利累乘效應，必定高估實質成長！評估跨期複利必須使用<strong>幾何平均數 (CAGR)</strong>。
        </p>

        <div class="formula-box">
          <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">CAGR 跨期公式解析</div>
          $$CAGR = \\sqrt[t]{\\frac{V_t}{V_0}} - 1 = \\left( \\frac{V_t}{V_0} \\right)^{\\frac{1}{t}} - 1$$
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.4rem;">
            在本例中：$t = 2$，初期 $V_0 = 100$，終期 $V_t = 100$：
            $$CAGR = \\left(\\frac{100}{100}\\right)^{\\frac{1}{2}} - 1 = 1 - 1 = \\mathbf{0\\%}$$
            實質反映資本兩年來淨成長率為 0%！
          </div>
        </div>
      </div>

      <!-- Card 3: 百分位數動態尺規 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">📏 課堂板書唯一標準：百分位數動態尺規 (0.5 乾淨步進)</span>
          <span class="badge badge-review">板書唯一真理</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.5rem;">
          課堂板書 IMG_0130 明確規定位置公式為：<strong>\\(L_x = \\frac{x}{100}(n - 1) + 1\\)</strong>，非整數項採線性內插。
        </p>
        <p style="color: #cbd5e1; font-size: 0.88rem; margin-bottom: 0.75rem;">
          💡 <strong>尺規位置直覺化</strong>：下方滑桿直接以 <strong>0.5</strong> 乾淨步進（從 1.0 開始至 9.0），計算出之小數項 $0.d$ 皆為 0.0 或 0.5，算出的內插值清爽俐落：
        </p>

        <!-- 百分位數互動微元件 -->
        <div class="interactive-widget-box ruler-container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <label style="font-weight: 600; color: #cbd5e1;">
              目標位置 \\(L\\)：<span id="rulerPctVal" style="color: #38bdf8; font-family: var(--font-mono); font-size: 1.1rem;">50% (L = 5.0)</span>
            </label>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; min-height: 36px; font-size: 0.8rem;" onclick="stepRuler(-0.5)">◀ -0.5</button>
              <input type="range" id="rulerSlider" min="1.0" max="9.0" step="0.5" value="5.0" style="width: 180px; cursor: pointer;">
              <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; min-height: 36px; font-size: 0.8rem;" onclick="stepRuler(+0.5)">+0.5 ▶</button>
            </div>
          </div>

          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
            <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; min-height: 32px;" onclick="setRulerPos(3.0)">Q1 第 1 四分位數 (L=3.0, P25)</button>
            <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; min-height: 32px;" onclick="setRulerPos(5.0)">中位數 Median (L=5.0, P50)</button>
            <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; min-height: 32px;" onclick="setRulerPos(7.0)">Q3 第 3 四分位數 (L=7.0, P75)</button>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            給定排序數列 ($n = 9$)：<code style="color: #a5b4fc;">[10, 15, 18, 24, 30, 36, 42, 50, 60]</code>
          </div>

          <!-- 動態尺規軸 -->
          <div class="ruler-track" id="rulerTrack">
            <!-- 由 JS 動態生成 9 個點 -->
          </div>

          <!-- 即時計算與內插看板 -->
          <div style="background: rgba(30, 41, 59, 0.9); padding: 0.75rem 1rem; border-radius: 8px; font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.6;" id="rulerResultBox">
            <!-- 動態算式 -->
          </div>
        </div>
      </div>

      <!-- Card 4: 離散趨勢指標完整宇宙 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">📐 離散趨勢指標完整宇宙 (Measures of Dispersion)</span>
          <span class="badge badge-mastered">公式全解析</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">
          集中趨勢只告訴我們「重心在哪」，而離散程度則呈現「風險與波動有多大」。
        </p>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">樣本變異數 ($S^2$) 為什麼除以 $n-1$？</div>
            $$S^2 = \\frac{\\sum_{i=1}^n (X_i - \\bar{X})^2}{n - 1}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              <strong>貝索校正 (Bessel's Correction)</strong>：計算離差平方和已消耗了估計值 $\\bar{X}$，少掉了 1 個自由度。若除以 $n$ 會系統性低估母體變異數；除以 $n-1$ 才能得到母體變異數 $\\sigma^2$ 的<strong>不偏估計量 (Unbiased Estimator)</strong>！
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">樣本標準差 ($S$)</div>
            $$S = \\sqrt{S^2} = \\sqrt{\\frac{\\sum (X_i - \\bar{X})^2}{n - 1}}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              將變異數開根號，將單位<strong>還原至與原始觀測值完全相同的度量單位</strong>（如由元² 變為 元），方便直觀解釋與繪圖。
            </div>
          </div>
        </div>

        <!-- 常態分佈經驗法則 SVG 視覺圖解 -->
        <div class="visual-card" style="margin-top: 1rem;">
          <div style="font-weight: 700; color: #38bdf8; margin-bottom: 0.5rem;">🔔 常態分佈經驗法則 (Empirical Rule 68% - 95% - 99.7%)</div>
          <p style="font-size: 0.88rem; color: #e2e8f0; margin-bottom: 0.6rem; line-height: 1.6;">
            <strong>【核心直觀意義：衡量數據圍繞平均數聚集的密集程度】</strong><br>
            這三個關鍵百分比揭示了常態資料<strong>「有多密集地聚攏在平均值 $\bar{X}$ 周遭」</strong>。在對稱鐘形分佈下，離平均值越近的區間密度最高，超過 $3S$ 以外的極端值機率趨近於零！
          </p>

          <div class="svg-diagram-container">
            <svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
              <path d="M 45 150 Q 150 148 220 50 Q 270 20 320 50 Q 390 148 495 150 Z" fill="rgba(16, 185, 129, 0.15)"/>
              <path d="M 120 150 Q 180 140 230 55 Q 270 20 310 55 Q 360 140 420 150 Z" fill="rgba(6, 182, 212, 0.25)"/>
              <path d="M 195 150 Q 230 110 250 40 Q 270 20 290 40 Q 310 110 345 150 Z" fill="rgba(99, 102, 241, 0.4)"/>
              <path d="M 20 150 C 120 150 180 140 230 55 C 250 20 270 20 290 20 C 310 20 330 55 350 55 C 400 140 460 150 520 150" fill="none" stroke="#6366f1" stroke-width="2.5"/>
              <line x1="20" y1="150" x2="520" y2="150" stroke="#475569" stroke-width="1.5"/>
              <line x1="270" y1="20" x2="270" y2="150" stroke="#f8fafc" stroke-width="1.5" stroke-dasharray="3,3"/>
              <text x="270" y="165" font-size="11" fill="#f8fafc" font-weight="700" text-anchor="middle">X̄</text>
              <line x1="195" y1="90" x2="195" y2="150" stroke="#818cf8" stroke-width="1" stroke-dasharray="2,2"/>
              <text x="195" y="165" font-size="10" fill="#a5b4fc" text-anchor="middle">X̄ - 1S</text>
              <line x1="345" y1="90" x2="345" y2="150" stroke="#818cf8" stroke-width="1" stroke-dasharray="2,2"/>
              <text x="345" y="165" font-size="10" fill="#a5b4fc" text-anchor="middle">X̄ + 1S</text>
              <line x1="120" y1="130" x2="120" y2="150" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>
              <text x="120" y="165" font-size="10" fill="#38bdf8" text-anchor="middle">X̄ - 2S</text>
              <line x1="420" y1="130" x2="420" y2="150" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2,2"/>
              <text x="420" y="165" font-size="10" fill="#38bdf8" text-anchor="middle">X̄ + 2S</text>
              <text x="45" y="165" font-size="10" fill="#34d399" text-anchor="middle">X̄ - 3S</text>
              <text x="495" y="165" font-size="10" fill="#34d399" text-anchor="middle">X̄ + 3S</text>
              <rect x="235" y="60" width="70" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#6366f1"/>
              <text x="270" y="74" font-size="11" fill="#c7d2fe" font-weight="700" text-anchor="middle">≈ 68.3%</text>
              <rect x="225" y="95" width="90" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#06b6d4"/>
              <text x="270" y="109" font-size="11" fill="#67e8f9" font-weight="700" text-anchor="middle">≈ 95.4%</text>
              <rect x="215" y="125" width="110" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#10b981"/>
              <text x="270" y="139" font-size="11" fill="#6ee7b7" font-weight="700" text-anchor="middle">≈ 99.7%</text>
            </svg>
          </div>

          <!-- 具體商務品管範例：連鎖咖啡充填容量 -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 8px; padding: 0.85rem; margin-top: 0.75rem;">
            <div style="font-weight: 700; color: #38bdf8; font-size: 0.92rem; margin-bottom: 0.4rem;">☕ 實務商務案例：連鎖超商外帶咖啡充填容量品管</div>
            <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.7;">
              假設某超商自動咖啡機之充填容量服從常態分佈，平均充填量 $\bar{X} = 300\text{ ml}$，樣本標準差 $S = 10\text{ ml}$：
              <ul style="margin: 0.3rem 0 0.3rem 1.25rem; padding: 0;">
                <li><strong style="color: #a5b4fc;">$\bar{X} \pm 1S$（$290 \sim 310\text{ ml}$）</strong>：約有 <strong>$68.3\%$</strong>（超過三分之二）的咖啡杯容量落在這段最核心範圍內。</li>
                <li><strong style="color: #38bdf8;">$\bar{X} \pm 2S$（$280 \sim 320\text{ ml}$）</strong>：涵蓋高達 <strong>$95.4\%$</strong> 的咖啡，僅有約 $4.6\%$ 會偏離此區間（品管合格標準常設於此）。</li>
                <li><strong style="color: #34d399;">$\bar{X} \pm 3S$（$270 \sim 330\text{ ml}$）</strong>：幾乎涵蓋全部杯子（<strong>$99.7\%$</strong>）！若出現容量 $< 270\text{ ml}$（嚴重偷工減料顧客客訴）或 $> 330\text{ ml}$（滿溢燙傷）的極端異常杯數<strong>合計不到 $0.3\%$</strong>（每 1,000 杯中不到 3 杯），一旦出現即可認定為設備故障或極端異常！</li>
              </ul>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 0.4rem;">
                ⚠️ <strong>柴比氏定理對比 (Chebyshev)</strong>：若為<strong>任意非對稱分佈</strong>，則不能用經驗法則，須改用柴比氏定理（在 $\bar{X} \pm kS$ 內至少佔 $1 - 1/k^2$，當 $k=2$ 時至少 $75\%$）。
              </div>
            </div>
          </div>
        </div>

        <div class="visual-card-grid" style="margin-top: 1rem;">
          <div class="visual-card">
            <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.4rem;">變異係數 (Coefficient of Variation, CV)</div>
            $$CV = \\frac{S}{\\bar{X}} \\times 100\\%$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              <strong>無因次指標（無單位）</strong>，消除尺度差異！專門用於跨尺度比較相對波動程度。<br>
              <strong>經典對照</strong>：高價股 $1000 \\pm 50$ ($CV = 5\\%$) vs 水餃股 $10 \\pm 2$ ($CV = 20\\%$)。水餃股看似波動僅 2 元，但其<strong>相對風險高達高價股的 4 倍</strong>！
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #a78bfa; margin-bottom: 0.4rem;">四分位距 (IQR) 與盒鬚圖圍欄</div>
            $$IQR = Q_3 - Q_1 = P_{75} - P_{25}$$
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 0.4rem; line-height: 1.6;">
              涵蓋中間 50% 核心觀測值，不受極端值影響。<br>
              <strong>📐 板書唯一標準位置公式（依課堂唯一規範）</strong>：
              <div style="background: rgba(15, 23, 42, 0.65); padding: 0.5rem 0.75rem; border-radius: 6px; margin: 0.4rem 0; border: 1px solid rgba(167, 139, 250, 0.3);">
                • <strong>$Q_1$（第一四分位數）</strong> $= P_{25} \implies$ 板書位置公式：<strong>$L_{25\%} = \\frac{25}{100}(n-1) + 1$</strong><br>
                • <strong>$Q_2$（第二四分位數 / 中位數）</strong> $= P_{50} \implies$ 板書位置公式：<strong>$L_{50\%} = \\frac{50}{100}(n-1) + 1$</strong><br>
                • <strong>$Q_3$（第三四分位數）</strong> $= P_{75} \implies$ 板書位置公式：<strong>$L_{75\%} = \\frac{75}{100}(n-1) + 1$</strong><br>
                • <strong>計算順序</strong>：先用板書位置算出 $L_{25\%}$ 與 $L_{75\%}$ 後，經線性內插求得數值 $Q_1$ 與 $Q_3$，再相減算出 $IQR = Q_3 - Q_1$！
              </div>
              <strong>🚨 異常值判定圍欄 (Outlier Fences)</strong>：
              $$\\text{下界} = Q_1 - 1.5 \\times IQR, \\quad \\text{上界} = Q_3 + 1.5 \\times IQR$$
              落在圍欄外的數據點即為統計離群值 (Outliers)！
            </div>
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
      <!-- Card 1: 2x2 列聯表與屬性分流 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">📊 二元屬性 2x2 列聯表 (Binary Contingency Table)</span>
          <span class="badge badge-mastered">核心結構</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          在顧客購買紀錄、使用者行為特徵等二元（0/1）資料中，我們透過 2x2 列聯表統計兩物件之間的四種可能狀態：
        </p>

        <div class="contingency-table-wrapper">
          <table class="contingency-table">
            <tr>
              <th colspan="2" rowspan="2" style="background: #0f172a;">二元屬性列聯表</th>
              <th colspan="2" style="background: #1e293b;">物件 2 (乙顧客)</th>
              <th rowspan="2" style="background: #0f172a;">合計</th>
            </tr>
            <tr>
              <th>1 (有購買 / 具備)</th>
              <th>0 (未購買 / 無)</th>
            </tr>
            <tr>
              <th rowspan="2" style="background: #1e293b; padding: 0.5rem;">物件 1 (甲顧客)</th>
              <td style="font-weight: 600;">1 (有購買)</td>
              <td class="cell-dual-one"><strong>d</strong> (雙 1：兩者皆有)</td>
              <td class="cell-single-c"><strong>c</strong> (甲有、乙無)</td>
              <td class="cell-total">c + d</td>
            </tr>
            <tr>
              <td style="font-weight: 600;">0 (未購買)</td>
              <td class="cell-single-b"><strong>b</strong> (甲無、乙有)</td>
              <td class="cell-dual-zero"><strong>a</strong> (雙 0：兩者皆無)</td>
              <td class="cell-total">a + b</td>
            </tr>
            <tr>
              <th colspan="2" style="background: #0f172a;">合計</th>
              <td class="cell-total">b + d</td>
              <td class="cell-total">a + c</td>
              <td class="cell-total" style="color: #38bdf8; font-weight: 700;">N = a+b+c+d</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Card 2: SMC vs Jaccard 雙雄對決 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">⚖️ 簡單匹配係數 (SMC) vs 雅卡爾指數 (Jaccard)</span>
          <span class="badge badge-review">關鍵判別</span>
        </div>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">簡單匹配係數 (SMC)</div>
            $$SMC = \\frac{a + d}{a + b + c + d} = \\frac{\\text{雙無 } a + \\text{雙有 } d}{N}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              <strong>適用：對稱性二元屬性 (Symmetric)</strong><br>
              0 與 1 地位完全平等，雙方「都沒有 (a)」與「都有 (d)」具備同等的分析價值（例如：性別、工廠品管合格 0/不合格 1）。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">雅卡爾指數 (Jaccard)</div>
            $$Jaccard = \\frac{d}{b + c + d} = \\frac{\\text{雙有 } d}{\\text{總有效事件 (排除 } a)}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              <strong>適用：非對稱稀疏二元屬性 (Asymmetric)</strong><br>
              1 代表關鍵正向事件（買過、點擊、感染），而 0 僅代表沒買。<strong>海量的雙 0 (a) 毫無參考價值，必須直接「拿掉 a」！</strong>
            </div>
          </div>
        </div>

        <!-- 雙 0 動態實驗器 -->
        <div class="interactive-widget-box">
          <div style="font-weight: 700; color: #cbd5e1; margin-bottom: 0.75rem;">🧪 核心心法：拿掉 a！雙 0 膨脹微實驗器</div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
            固定設定：甲乙都買了 2 件 (d=2)，甲買乙未買 2 件 (c=2)，甲未買乙買 1 件 (b=1)。點擊切換未買商品數 (a)：
          </p>
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;" id="dualZeroButtonsContainer">
            <button class="btn btn-primary" data-a="5" onclick="adjustDualZero(5)">a = 5 (小型超商)</button>
            <button class="btn btn-secondary" data-a="50" onclick="adjustDualZero(50)">a = 50 (中型超市)</button>
            <button class="btn btn-secondary" data-a="500" onclick="adjustDualZero(500)">a = 500 (大型量販)</button>
            <button class="btn btn-secondary" data-a="5000" onclick="adjustDualZero(5000)">a = 5000 (電商巨頭)</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" id="dualZeroMetrics">
            <!-- 動態注入 SMC 與 Jaccard 對比 -->
          </div>
          <div id="dualZeroExplanation" style="margin-top: 0.75rem; font-size: 0.88rem; color: #a5b4fc; background: rgba(15,23,42,0.7); padding: 0.6rem; border-radius: 6px;">
          </div>
        </div>

        <div class="callout-box callout-sky" style="margin-top: 1rem;">
          <div style="font-weight: 700; margin-bottom: 0.3rem;">🔄 相似度與距離之互補方程式 (Distance = 1 - Similarity)</div>
          <p style="font-size: 0.88rem; margin-bottom: 0.4rem;">
            距離（相異度 Dissimilarity）衡量物件間的差距。相似度越大，距離越小：
          </p>
          $$d_{SMC} = 1 - SMC = \\frac{b + c}{a + b + c + d}, \\quad d_{Jaccard} = 1 - Jaccard = \\frac{b + c}{b + c + d}$$
          <div style="font-size: 0.82rem; color: #94a3b8;">
            特質：距離介於 $0$ 到 $1$ 之間。完全相同時距離為 0，完全相反時距離為 1。
          </div>
        </div>

        <!-- 觀念 Checkpoint -->
        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">🎯 觀念確認 Checkpoint</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
            下列何種商務情境「應優先選用 SMC 而非 Jaccard」？
          </p>
          <div style="display: flex; gap: 0.5rem; flex-direction: column;" id="u2CheckpointOptions">
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU2Checkpoint(this, false)">
              A. 串流影音平台千萬首歌曲之共同收聽紀錄（極為稀疏）
            </button>
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU2Checkpoint(this, true)">
              B. 工廠精密零件規格檢驗（雙方皆無缺陷『雙 0』代表共同合規，具備高度管理價值）
            </button>
          </div>
          <div id="u2CheckpointFeedback" style="margin-top: 0.5rem;"></div>
        </div>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
    adjustDualZero(5);
  } else if (unitId === "ch03-probability") {
    container.innerHTML = `
      <!-- Card 1: 機率法則與互斥相依陷阱 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">🎲 機率四大運算法則與相依性陷阱</span>
          <span class="badge badge-mastered">考場核心</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          機率運算的基礎來自集合論，清楚掌握事件之間的關係是解出推論統計題目的第一步：
        </p>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">聯集加法定理 (Union)</div>
            $$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              若 $A$ 與 $B$ 互斥，則交集 $P(A \\cap B) = 0$。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">條件機率 (Conditional)</div>
            $$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              乘法法則：$P(A \\cap B) = P(A|B) \\cdot P(B)$。
            </div>
          </div>
        </div>

        <div class="callout-box callout-rose">
          <div style="font-weight: 700; margin-bottom: 0.4rem;">🚨 考場必殺陷阱：互斥且非零機率必為「相依 (Dependent)」！</div>
          <p style="font-size: 0.9rem; line-height: 1.6;">
            <strong>互斥 (Mutually Exclusive)</strong>：$A \\cap B = \\emptyset \\implies P(A \\cap B) = 0$。<br>
            <strong>獨立 (Independent)</strong>：$P(A \\cap B) = P(A) \\cdot P(B)$。<br>
            若 $P(A) > 0$ 且 $P(B) > 0$，其乘積 $P(A)P(B) > 0 \\ne 0$！兩者絕不可能同時成立！<br>
            <strong>直覺解讀</strong>：若 A 發生了，B 絕對不可能發生（B 發生機率瞬間降為 0）。得知 A 發生，強烈改變了 B 的機率，因此<strong>必然相依</strong>！
          </p>
        </div>
      </div>

      <!-- Card 2: 全機率定理與樹狀分割 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">🌳 全機率定理 (Law of Total Probability) 空間分割</span>
          <span class="badge badge-mastered">貝氏分母</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          當樣本空間 $S$ 被互斥且完備的子事件 $A_1, A_2, \\dots, A_k$ 完全分割時（$\\sum P(A_i) = 1$），任何事件 $B$ 的邊際總機率為所有可能途徑之和：
        </p>

        <div class="formula-box">
          <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">全機率定理分解公式</div>
          $$P(B) = \\sum_{i=1}^k P(A_i \\cap B) = \\sum_{i=1}^k P(B|A_i) \\cdot P(A_i)$$
        </div>

        <!-- 樹狀分支圖 SVG -->
        <div class="svg-diagram-container">
          <svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
            <!-- 根節點 -->
            <circle cx="50" cy="90" r="18" fill="#6366f1"/>
            <text x="50" y="94" font-size="11" fill="#ffffff" font-weight="700" text-anchor="middle">S</text>

            <!-- 先驗分支線 -->
            <line x1="68" y1="80" x2="180" y2="40" stroke="#818cf8" stroke-width="2"/>
            <text x="120" y="50" font-size="10" fill="#a5b4fc" text-anchor="middle">P(A1)</text>

            <line x1="68" y1="90" x2="180" y2="90" stroke="#818cf8" stroke-width="2"/>
            <text x="120" y="85" font-size="10" fill="#a5b4fc" text-anchor="middle">P(A2)</text>

            <line x1="68" y1="100" x2="180" y2="140" stroke="#818cf8" stroke-width="2"/>
            <text x="120" y="130" font-size="10" fill="#a5b4fc" text-anchor="middle">P(A3)</text>

            <!-- 中間 A 節點 -->
            <rect x="180" y="25" width="45" height="30" rx="6" fill="#1e293b" stroke="#6366f1" stroke-width="1.5"/>
            <text x="202" y="44" font-size="11" fill="#f8fafc" font-weight="700" text-anchor="middle">A1</text>

            <rect x="180" y="75" width="45" height="30" rx="6" fill="#1e293b" stroke="#6366f1" stroke-width="1.5"/>
            <text x="202" y="94" font-size="11" fill="#f8fafc" font-weight="700" text-anchor="middle">A2</text>

            <rect x="180" y="125" width="45" height="30" rx="6" fill="#1e293b" stroke="#6366f1" stroke-width="1.5"/>
            <text x="202" y="144" font-size="11" fill="#f8fafc" font-weight="700" text-anchor="middle">A3</text>

            <!-- 條件分支線 -->
            <line x1="225" y1="40" x2="350" y2="40" stroke="#06b6d4" stroke-width="1.5"/>
            <text x="285" y="32" font-size="10" fill="#67e8f9" text-anchor="middle">P(B|A1)</text>

            <line x1="225" y1="90" x2="350" y2="90" stroke="#06b6d4" stroke-width="1.5"/>
            <text x="285" y="82" font-size="10" fill="#67e8f9" text-anchor="middle">P(B|A2)</text>

            <line x1="225" y1="140" x2="350" y2="140" stroke="#06b6d4" stroke-width="1.5"/>
            <text x="285" y="132" font-size="10" fill="#67e8f9" text-anchor="middle">P(B|A3)</text>

            <!-- 右側結果標籤 -->
            <text x="360" y="44" font-size="11" fill="#34d399" font-weight="700">P(A1 ∩ B)</text>
            <text x="360" y="94" font-size="11" fill="#34d399" font-weight="700">P(A2 ∩ B)</text>
            <text x="360" y="144" font-size="11" fill="#34d399" font-weight="700">P(A3 ∩ B)</text>

            <!-- 匯總箭頭 -->
            <path d="M 450 40 Q 480 90 450 140" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3"/>
            <text x="490" y="95" font-size="11" fill="#fbbf24" font-weight="700" text-anchor="middle">Σ = P(B)</text>
          </svg>
        </div>
      </div>

      <!-- Card 3: 貝氏定理與偽陽性直覺案例 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">🧬 貝氏定理 (Bayes' Theorem) 逆向推論之神</span>
          <span class="badge badge-review">作業高頻考點</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          貝氏定理的核心本質是：<strong>以新獲得的檢驗證據（Likelihood），逆向修正最初的先驗信念（Prior），得到事後後驗機率（Posterior）</strong>。
        </p>

        <div class="formula-box">
          <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">貝氏逆向推論公式</div>
          $$P(A_i|B) = \\frac{P(B|A_i) P(A_i)}{P(B)} = \\frac{P(B|A_i) P(A_i)}{\\sum_{j=1}^k P(B|A_j) P(A_j)}$$
        </div>

        <div class="callout-box callout-amber">
          <div style="font-weight: 700; margin-bottom: 0.4rem;">💡 罕見疾病快篩「偽陽性悖論」直覺解析 (Medical Screening Walkthrough)</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">
            某罕見傳染病之人口盛行率為 $1\\%$（$P(D) = 0.01$，健康者 $P(H) = 0.99$）。<br>
            醫院快篩準確度（敏感度）高達 $95\\%$（$P(+|D) = 0.95$），健康者的偽陽性率為 $5\\%$（$P(+|H) = 0.05$）。<br>
            <strong>若小明快篩呈陽性 (+)，他真正罹病的機率為何？</strong>
          </p>
          <div style="background: rgba(15, 23, 42, 0.6); padding: 0.75rem; border-radius: 6px; font-size: 0.88rem; line-height: 1.6;">
            <strong>想像隨機抽檢 1,000 人：</strong>
            <ul style="padding-left: 1.25rem;">
              <li>患病者 10 人 $\\to$ 測出陽性者為 $10 \\times 0.95 = \\mathbf{9.5 \\text{ 人}}$（真陽性）</li>
              <li>健康者 990 人 $\\to$ 被誤判陽性者為 $990 \\times 0.05 = \\mathbf{49.5 \\text{ 人}}$（偽陽性！）</li>
              <li>所有驗出陽性總人數 $= 9.5 + 49.5 = \\mathbf{59 \\text{ 人}}$</li>
            </ul>
            $$P(\\text{患病 } D | \\text{陽性 } +) = \\frac{9.5}{59} \\approx \\mathbf{16.1\\%}$$
            <strong>直覺結論</strong>：即使快篩宣稱有 95% 準確率，測出陽性真正患病的機率竟然只有 <strong>16.1%</strong>！因為健康族群基數極大，即使 5% 誤判累積的人數（49.5）也遠多於真病患（9.5）！
          </div>
        </div>
      </div>

      <!-- Card 4: 3.6 常見機率分配極速對照卡 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">⚡ 3.6 常見機率分配極速對照卡 (PMF vs PDF)</span>
          <span class="badge badge-mastered">速查必背</span>
        </div>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">二項分配 (Binomial) - 離散型</div>
            $$P(X=x) = \\binom{n}{x} p^x (1-p)^{n-x}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              $n$ 次獨立白努利試驗。<br>
              <strong>期望值</strong>：$E[X] = np$<br>
              <strong>變異數</strong>：$Var(X) = np(1-p)$
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">卜瓦松分配 (Poisson) - 離散型</div>
            $$P(X=x) = \\frac{e^{-\\lambda} \\lambda^x}{x!}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              單位時間或空間內稀有事件發生次數。<br>
              <strong>期望值等於變異數</strong>：$E[X] = \\lambda, Var(X) = \\lambda$！
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">常態分配 (Normal) - 連續型</div>
            $$X \\sim N(\\mu, \\sigma^2) \\implies Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1)$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              鐘形對稱，標準化公式 $Z = \\frac{X - \\mu}{\\sigma}$。<br>
              68-95-99.7 經驗法則基礎。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #f59e0b; margin-bottom: 0.4rem;">指數分配 (Exponential) - 連續型</div>
            $$f(x) = \\lambda e^{-\\lambda x} \\quad (x \\ge 0)$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              獨立事件相繼發生之等待時間。<br>
              <strong>無記憶性 (Memoryless)</strong>，期望值 $E[X] = 1/\\lambda$。
            </div>
          </div>
        </div>

        <div class="callout-box callout-rose" style="margin-top: 1rem;">
          <div style="font-weight: 700; margin-bottom: 0.2rem;">★ 連續型隨機變數關鍵鐵律：單點機率恆為零！</div>
          $$P(X = c) = 0 \\implies P(a \\le X \\le b) = P(a < X < b)$$
          連續型變數的機率為「機率密度函數 (PDF) 曲線下之面積」，單一垂直線條無寬度故面積恆為 0！
        </div>

        <!-- 觀念 Checkpoint -->
        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">🎯 觀念確認 Checkpoint</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
            若事件 A 與事件 B 互斥，且 $P(A) = 0.4$、$P(B) = 0.5$，請問 A 與 B 是否獨立？
          </p>
          <div style="display: flex; gap: 0.5rem; flex-direction: column;" id="u3CheckpointOptions">
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU3Checkpoint(this, false)">
              A. 獨立（互斥表示兩者各走各的路，互不影響）
            </button>
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU3Checkpoint(this, true)">
              B. 相依（互斥非零必相依！因 A 發生則 B 機率降為 0，強烈相依）
            </button>
          </div>
          <div id="u3CheckpointFeedback" style="margin-top: 0.5rem;"></div>
        </div>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
  } else if (unitId === "ch06-regression") {
    container.innerHTML = `
      <!-- Card 1: 五大假定 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">🛡️ 線性迴歸五大基本假定 (5 Assumptions of OLS)</span>
          <span class="badge badge-mastered">計量基石</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          最小平方法 (OLS) 的統計推論與信賴區間，全部奠基在下列五大假定上：
        </p>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.3rem;">1. 線性關係 (Linearity)</div>
            <div style="font-size: 0.85rem; color: #94a3b8;">
              應變數 $Y$ 與各自變數 $X_j$ 呈現線性組合。殘差圖中殘差點應隨機散佈於 0 兩側，<strong>不可呈現 U 型拋物線或彎曲趨勢</strong>。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.3rem;">2. 殘差常態性 (Normality)</div>
            <div style="font-size: 0.85rem; color: #94a3b8;">
              誤差項 $\\epsilon_i \\sim N(0, \\sigma^2)$。檢驗工具為 <strong>常態機率圖 (Normal Q-Q Plot)</strong>，若資料點緊密貼合 45 度對角線即代表符合。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.3rem;">3. 無完全共線性 (No Multicollinearity)</div>
            <div style="font-size: 0.85rem; color: #94a3b8;">
              自變數之間不可高度相關。指標：<strong>變異數膨脹因子 $VIF < 5$</strong>（若 $VIF \\ge 10$ 代表嚴重共線性，自變數過度重疊，標準誤失真）。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #f43f5e; margin-bottom: 0.3rem;">4. 同質變異性 (Homoscedasticity)</div>
            <div style="font-size: 0.85rem; color: #94a3b8;">
              殘差變異數保持定值 $\\sigma^2$。若殘差隨預測值增大而呈<strong>喇叭狀/漏斗狀擴散</strong>，即違反此假定（異質變異）。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #38bdf8; margin-bottom: 0.3rem;">5. 殘差獨立性 (Independence)</div>
            <div style="font-size: 0.85rem; color: #94a3b8;">
              殘差之間互相獨立無自我相關。檢驗統計量：<strong>Durbin-Watson (DW) 接近 2</strong>（若遠小於 2 代表正自相關）。
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: R² 陷阱與 R²adj -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">📈 判定係數 R² 陷阱與板書 IMG_0131 精闢解讀</span>
          <span class="badge badge-review">板書打叉註記</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          在多元線性迴歸中，只要隨便多塞入一個自變數，最小平方法 (OLS) 的數學特性保證 <strong>$R^2$ 永遠單調不減</strong>（只會上升或持平）！<br>
          因此板書特別打叉註記：<strong>「$R^2 \\rightarrow$ 模型的解釋能力；資料多，解釋能力不一定上升！」</strong><br>
          為了防止自欺欺人，必須看 <strong>調整後判定係數 ($R^2_{adj}$)</strong>，它會對自變數數量 $k$ 消耗的自由度施加懲罰。
        </p>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #f43f5e; margin-bottom: 0.4rem;">原始判定係數 $R^2$（易被灌水）</div>
            $$R^2 = 1 - \\frac{SSE}{SST}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              只要增加自變數，$SSE$ 絕不可能增加，因此 $R^2$ 必定非降！即使塞入 5 個擲骰子的隨機數，$R^2$ 也會被虛增。
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">調整後判定係數 $R^2_{adj}$（真功夫）</div>
            $$R^2_{adj} = 1 - \\frac{SSE / (n - k - 1)}{SST / (n - 1)}$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              引入自由度懲罰：只有當新加入變數帶來的邊際變異解釋量<strong>大於自由度損失時</strong>，$R^2_{adj}$ 才會上升！
            </div>
          </div>
        </div>

        <!-- P-value 視覺標尺 -->
        <div style="margin-top: 1.25rem;">
          <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.4rem;">板書 P-值判斷門檻視覺量表</div>
          <div class="p-gauge-bar">
            <div class="p-zone-01" title="p < 0.01: 99% 信心水準極顯著">p&lt;0.01 (99%)</div>
            <div class="p-zone-05" title="p < 0.05: 95% 信心水準顯著">p&lt;0.05 (95%)</div>
            <div class="p-zone-10" title="p < 0.10: 90% 邊際顯著">p&lt;0.10 (90%)</div>
            <div class="p-zone-fail" title="p >= 0.10: 不顯著">p ≥ 0.10 不顯著 (無法拒絕 H0)</div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #94a3b8;">
            <span>🟢 0.01：極顯著 (強烈拒絕 H0)</span>
            <span>🔵 0.05：通認顯著標準</span>
            <span>🟡 0.10：邊際顯著</span>
            <span>⚪ ≥ 0.10：不具統計顯著性</span>
          </div>
        </div>
      </div>

      <!-- Card 3: 虛擬變數 k-1 法則與交互作用項 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">🏷️ 虛擬變數 $k-1$ 法則與交互作用項</span>
          <span class="badge badge-mastered">實務重點</span>
        </div>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.4rem;">虛擬變數 $k-1$ 法則</div>
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">
              若一類別自變數有 $k$ 個水準（例如：四季 $k=4$），<strong>只能建立 $k-1 = 3$ 個虛擬變數</strong>！<br>
              未被定義的第 $k$ 個水準為<strong>「基準組 (Base Category)」</strong>，其效果被常數項 $\\beta_0$ 吸收。<br>
              若建了 $k$ 個虛擬變數，會引發<strong>「虛擬變數陷阱 (Dummy Variable Trap)」</strong>（矩陣完全共線性，無反矩陣可解）！
            </p>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">✖️ 交互作用項 (Interaction Term)</div>
            $$\\hat{Y} = b_0 + b_1 X_1 + b_2 X_2 + b_3 (X_1 \\cdot X_2) \\quad \\text{或 } \\hat{Y} = a + Z_1 X_1 + Z_2 X_2 + Z_3 (X_1 X_2)$$
            <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5;">
              $X_1$ 對 $Y$ 的邊際影響斜率為 $(b_1 + b_3 X_2)$，其效果會隨著 $X_2$ 的數值高低而變動！在幾何圖形上呈現<strong>非平行交叉線</strong>。
            </p>
          </div>
        </div>

        <!-- 交互作用項非平行線 SVG 圖解 -->
        <div class="svg-diagram-container" style="margin-top: 1rem;">
          <svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg">
            <line x1="50" y1="150" x2="450" y2="150" stroke="#475569" stroke-width="1.5"/>
            <line x1="50" y1="150" x2="50" y2="20" stroke="#475569" stroke-width="1.5"/>
            <text x="440" y="165" font-size="11" fill="#94a3b8">X1</text>
            <text x="35" y="25" font-size="11" fill="#94a3b8">Y</text>

            <!-- 組別 A (X2=0) 平緩線 -->
            <line x1="50" y1="120" x2="420" y2="60" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="425" y="60" font-size="10" fill="#38bdf8" font-weight="700">組別 A (X2 = 0，斜率 b1)</text>

            <!-- 組別 B (X2=1) 陡峭線 -->
            <line x1="50" y1="140" x2="380" y2="25" stroke="#f43f5e" stroke-width="2.5"/>
            <text x="385" y="25" font-size="10" fill="#f43f5e" font-weight="700">組別 B (X2 = 1，斜率 b1 + b3)</text>

            <!-- 交叉點標記 -->
            <circle cx="150" cy="103" r="5" fill="#fbbf24"/>
            <text x="160" y="105" font-size="10" fill="#fbbf24">非平行交叉 (交互作用顯著)</text>
          </svg>
        </div>

        <!-- 觀念 Checkpoint -->
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
  } else if (unitId === "ch10-lp") {
    container.innerHTML = `
      <!-- Card 1: 圖解法與極值點定理 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">📐 線性規劃圖解法幾何直覺與極值點定理</span>
          <span class="badge badge-mastered">核心定理</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          在二元線性規劃中，每一個限制式半平面共同交集出一個<strong>凸多邊形的可行解區域 (Feasible Region)</strong>。
        </p>

        <div class="callout-box callout-emerald">
          <div style="font-weight: 700; margin-bottom: 0.3rem;">👑 極值點定理 (Extreme Point / Corner Point Theorem)</div>
          <p style="font-size: 0.9rem; line-height: 1.6;">
            若線性規劃在有界可行解區域內存在最佳解，<strong>最佳解必定發生在可行解區域的頂點（Corner Points / 極值點）上</strong>！<br>
            <strong>求解四步法</strong>：1. 畫出限制式邊界直線 $\\to$ 2. 塗滿可行解區域 $\\to$ 3. 解聯立方程求所有頂點坐標 $(X_1, X_2)$ $\\to$ 4. 代入目標函數 $Z$ 挑選最大或最小值！
          </p>
        </div>

        <!-- 線性規劃圖解法 SVG 圖解 -->
        <div class="svg-diagram-container">
          <svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">
            <line x1="50" y1="180" x2="420" y2="180" stroke="#475569" stroke-width="1.5"/>
            <line x1="50" y1="180" x2="50" y2="20" stroke="#475569" stroke-width="1.5"/>
            <text x="410" y="195" font-size="11" fill="#94a3b8">X1</text>
            <text x="35" y="25" font-size="11" fill="#94a3b8">X2</text>

            <!-- 陰影凸多邊形可行解區域 -->
            <polygon points="50,180 230,180 200,80 50,70" fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" stroke-width="2"/>
            <text x="120" y="130" font-size="11" fill="#a5b4fc" font-weight="700">可行解區域</text>

            <!-- 頂點標記 -->
            <circle cx="50" cy="180" r="5" fill="#38bdf8"/>
            <text x="30" y="195" font-size="10" fill="#38bdf8">(0, 0)</text>

            <circle cx="230" cy="180" r="5" fill="#38bdf8"/>
            <text x="235" y="195" font-size="10" fill="#38bdf8">A (4, 0)</text>

            <!-- 最佳解頂點 -->
            <circle cx="200" cy="80" r="7" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
            <text x="212" y="80" font-size="11" fill="#34d399" font-weight="700">B (3, 2) 🌟 最佳解！</text>

            <circle cx="50" cy="70" r="5" fill="#38bdf8"/>
            <text x="10" y="65" font-size="10" fill="#38bdf8">C (0, 3)</text>

            <!-- 等利潤線 Isoprofit line -->
            <line x1="80" y1="20" x2="320" y2="140" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="325" y="145" font-size="10" fill="#fbbf24">Max Z 等利潤線</text>
          </svg>
        </div>
      </div>

      <!-- Card 2: 寬鬆變數 vs 剩餘變數 與 交叉相乘線性化 -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">⚖️ 寬鬆變數 vs 剩餘變數 & 比例限制交叉相乘線性化</span>
          <span class="badge badge-review">手算必考</span>
        </div>

        <div class="visual-card-grid">
          <div class="visual-card">
            <div style="font-weight: 700; color: #38bdf8; margin-bottom: 0.4rem;">寬鬆變數 (Slack, $S \\ge 0$)</div>
            $$a_1 X_1 + a_2 X_2 + S = b \\quad (\\le \\text{ 限制式})$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              用於「$\\le$ 資源上限」。$S$ 代表<strong>未耗盡之閒置資源</strong>。若 $S = 0$，代表資源被完全吃光，為<strong>緊迫限制 (Binding Constraint / 瓶頸資源)</strong>！
            </div>
          </div>

          <div class="visual-card">
            <div style="font-weight: 700; color: #34d399; margin-bottom: 0.4rem;">剩餘變數 (Surplus, $E \\ge 0$)</div>
            $$a_1 X_1 + a_2 X_2 - E = b \\quad (\\ge \\text{ 限制式})$$
            <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 0.4rem;">
              用於「$\\ge$ 最低需求」。$E$ 代表<strong>超越最低規格的超額產量</strong>。若 $E = 0$，代表剛好達標，為<strong>緊迫限制 (Binding Constraint)</strong>！
            </div>
          </div>
        </div>

        <!-- 公平成性交叉相乘步驟卡 -->
        <div class="callout-box callout-sky" style="margin-top: 1rem;">
          <div style="font-weight: 700; margin-bottom: 0.4rem;">🔄 比例限制交叉相乘 4 步線性化 (Linearization Step-by-Step)</div>
          <p style="font-size: 0.88rem; margin-bottom: 0.5rem;">
            題目常考：「產品 1 產量必須佔總產量至少 40%」，列式為非線性（未知數在分母）：
            $$\\frac{X_1}{X_1 + X_2} \\ge 0.4$$
          </p>
          <div class="concept-step-grid">
            <div class="concept-step-card">
              <span class="concept-step-num">1</span><strong>交叉相乘去分母</strong>
              <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.2rem;">$X_1 \\ge 0.4(X_1 + X_2)$</div>
            </div>
            <div class="concept-step-card">
              <span class="concept-step-num">2</span><strong>展開括號乘積</strong>
              <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.2rem;">$X_1 \\ge 0.4X_1 + 0.4X_2$</div>
            </div>
            <div class="concept-step-card">
              <span class="concept-step-num">3</span><strong>同類項移至左側</strong>
              <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.2rem;">$(1 - 0.4)X_1 - 0.4X_2 \\ge 0$</div>
            </div>
            <div class="concept-step-card">
              <span class="concept-step-num">4</span><strong>標準線性限制式</strong>
              <div style="font-size: 0.82rem; color: #34d399; font-weight: 700; margin-top: 0.2rem;">$0.6X_1 - 0.4X_2 \\ge 0$ ($3X_1 - 2X_2 \\ge 0$)</div>
            </div>
          </div>
        </div>

        <!-- 斜率三明治定理 -->
        <div class="callout-box callout-amber" style="margin-top: 1rem;">
          <div style="font-weight: 700; margin-bottom: 0.3rem;">🥪 目標函數斜率敏感度分析：三明治夾角 vs 軸截點單邊界</div>
          <p style="font-size: 0.88rem; line-height: 1.6;">
            目標函數 $\\text{Max } Z = c_1 X_1 + c_2 X_2$ 之等利潤線斜率為 $m_Z = -\\frac{c_1}{c_2}$。<br>
            <strong>1. 兩條資源限制式交會之頂點（雙邊三明治）</strong>：<br>
            若最佳解由邊界線 $L_1$ (斜率 $m_1$) 與 $L_2$ (斜率 $m_2$) 交會而成：
            $$\\min(m_1, m_2) \\le -\\frac{c_1}{c_2} \\le \\max(m_1, m_2)$$
            只要目標函數斜率維持在兩相交邊界夾角三明治範圍內，最佳解頂點坐標完全不變！<br>
            <strong>2. 坐標軸截點頂點（單邊界 Axis Intercept Single-Sided Bound）</strong>：<br>
            若最佳解落在坐標軸截點上（如 $(X_1, 0)$，由非負限制 $X_2 \\ge 0$ 與一條限制式相交），敏感度範圍為<strong>單側邊界（如 $-\\frac{c_1}{c_2} \\le m_1$）</strong>，僅受單一邊界線約束！
          </p>
        </div>

        <!-- 觀念 Checkpoint -->
        <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
          <div style="font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">🎯 觀念確認 Checkpoint</div>
          <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
            在線性規劃圖解法中，若某一資源上限限制式 ($\\le$) 的寬鬆變數為 $S = 0$，代表該資源現狀為何？
          </p>
          <div style="display: flex; gap: 0.5rem; flex-direction: column;" id="u5CheckpointOptions">
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU5Checkpoint(this, false)">
              A. 還有寬裕剩餘未耗盡，非瓶頸資源
            </button>
            <button class="btn btn-secondary" style="text-align: left; justify-content: flex-start;" onclick="checkU5Checkpoint(this, true)">
              B. 恰好完全耗盡，為緊迫限制 (Binding Constraint / 瓶頸資源)
            </button>
          </div>
          <div id="u5CheckpointFeedback" style="margin-top: 0.5rem;"></div>
        </div>
      </div>
    `;

    elContentArea.appendChild(container);
    renderMath(container);
  } else if (unitId === "ch13-decision") {
    container.innerHTML = `
      <!-- Card 1: 決策準則心態視覺化 (13.2) -->
      <div class="concept-card">
        <div class="visual-card-header">
          <span style="color: #38bdf8; font-size: 1.15rem;">⚖️ 決策準則心態視覺化 (Strictly 13.2 Scope)</span>
          <span class="badge badge-mastered">無機率決策</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">
          在無法得知未來景氣機率的不確定情境下，四種經典準則體現了四種截然不同的商業決策哲學：
        </p>

        <div class="interactive-widget-box">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;" id="decisionButtonsContainer">
            <button class="btn btn-primary" data-mode="maximax" onclick="setDecisionSpotlight('maximax')">🌟 樂觀準則 (Maximax)</button>
            <button class="btn btn-secondary" data-mode="maximin" onclick="setDecisionSpotlight('maximin')">🛡️ 悲觀準則 (Maximin)</button>
            <button class="btn btn-secondary" data-mode="laplace" onclick="setDecisionSpotlight('laplace')">⚖️ 機率均等 (Laplace)</button>
            <button class="btn btn-secondary" data-mode="minimax_regret" onclick="setDecisionSpotlight('minimax_regret')">💔 機會損失最小化 (Minimax Regret)</button>
          </div>

          <div id="decisionTableContainer">
            <!-- 動態繪製表格與聚焦光圈 -->
          </div>

          <div id="decisionExplanationBox" style="margin-top: 0.75rem; font-size: 0.9rem; color: #38bdf8; background: rgba(15,23,42,0.8); padding: 0.75rem; border-radius: 8px;">
            <!-- 動態解讀文字 -->
          </div>
        </div>

        <!-- 4 步遺憾矩陣推導視覺表 -->
        <div class="callout-box callout-sky" style="margin-top: 1rem;">
          <div style="font-weight: 700; margin-bottom: 0.4rem;">📋 4 步遺憾矩陣推導視覺表 (Visual 4-Step Transformation)</div>
          <div class="concept-step-grid">
            <div class="concept-step-card">
              <span class="concept-step-num">1</span><strong>原始報償矩陣</strong>
              <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.2rem;">寫出各方案在各情境下的獲利 $V_{ij}$。</div>
            </div>
            <div class="concept-step-card">
              <span class="concept-step-num">2</span><strong>各行基準最大值</strong>
              <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.2rem;">鎖定各景氣直行最佳表現 $V_j^* = \\max_i V_{ij}$。</div>
            </div>
            <div class="concept-step-card">
              <span class="concept-step-num">3</span><strong>計算機會損失</strong>
              <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 0.2rem;">$R_{ij} = V_j^* - V_{ij} \\ge 0$（少賺了多少即為遺憾）。</div>
            </div>
            <div class="concept-step-card">
              <span class="concept-step-num">4</span><strong>各列最大取最小</strong>
              <div style="font-size: 0.82rem; color: #34d399; font-weight: 700; margin-top: 0.2rem;">找出各方案最慘遺憾，挑選受傷最輕方案！</div>
            </div>
          </div>
        </div>

        <!-- 獲利矩陣 vs 成本矩陣 對照表 -->
        <div class="visual-card" style="margin-top: 1rem;">
          <div style="font-weight: 700; color: #a5b4fc; margin-bottom: 0.5rem;">💰 獲利矩陣 (Profit) vs 成本矩陣 (Cost) 轉換全對照</div>
          <div style="overflow-x: auto;">
            <table class="decision-table" style="min-width: 520px;">
              <tr>
                <th>決策指標</th>
                <th>獲利矩陣 (數字越大多好)</th>
                <th>成本 / 損失矩陣 (數字越小越好)</th>
              </tr>
              <tr>
                <td style="font-weight: 700;">樂觀準則 (Optimistic)</td>
                <td>$\\max_i (\\max_j V_{ij})$ (大中取大)</td>
                <td style="color: #38bdf8;">$\\min_i (\\min_j C_{ij})$ (小中取小)</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">悲觀準則 (Conservative)</td>
                <td>$\\max_i (\\min_j V_{ij})$ (小中取大)</td>
                <td style="color: #38bdf8;">$\\min_i (\\max_j C_{ij})$ (大中取小)</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">遺憾值基準 (Benchmark)</td>
                <td>各行取最大值：$V_j^* = \\max_i V_{ij}$</td>
                <td style="color: #38bdf8;">各行取最小值：$C_j^* = \\min_i C_{ij}$</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">遺憾值公式 (Regret)</td>
                <td>$R_{ij} = V_j^* - V_{ij}$ (少賺的錢)</td>
                <td style="color: #38bdf8;">$R_{ij} = C_{ij} - C_j^*$ (多花的冤枉錢)</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="callout-box callout-amber" style="margin-top: 1rem;">
          <div style="font-weight: 700; margin-bottom: 0.2rem;">🚫 考試範圍鎖定聲明</div>
          本科考試範圍嚴格遵守 13.2 節「不確定情況下之決策準則」，<strong>決策樹、EVPI、EVSI、事後後悔機率 100% 排除</strong>，請安心鎖定四大準則之計算！
        </div>

        <!-- 觀念 Checkpoint -->
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

window.checkU3Checkpoint = function (btn, isCorrect) {
  const fb = document.getElementById("u3CheckpointFeedback");
  if (isCorrect) {
    btn.className = "btn btn-emerald";
    fb.innerHTML = `
      <div style="color: #34d399; font-size: 0.88rem; margin-top: 0.4rem;">
        🎉 考點抓得極準！互斥且非零機率必相依（因 A 發生則 B 發生機率直接降為 0，強烈相依）！
      </div>
      <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="switchToLevel1()">進入 Level 1 實戰練習 →</button>
    `;
  } else {
    btn.className = "btn btn-amber";
    fb.innerHTML = `<div style="color: #fbbf24; font-size: 0.88rem; margin-top: 0.4rem;">互斥事件在非零機率下絕不可能獨立！因 P(A∩B)=0 ≠ P(A)P(B)=0.20。</div>`;
  }
  renderMath(fb);
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

window.checkU5Checkpoint = function (btn, isCorrect) {
  const fb = document.getElementById("u5CheckpointFeedback");
  if (isCorrect) {
    btn.className = "btn btn-emerald";
    fb.innerHTML = `
      <div style="color: #34d399; font-size: 0.88rem; margin-top: 0.4rem;">
        🎉 正確！寬鬆變數 S = 0 代表資源全數用盡，是為緊迫限制（Binding Constraint）！
      </div>
      <button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="switchToLevel1()">進入 Level 1 實戰練習 →</button>
    `;
  } else {
    btn.className = "btn btn-amber";
    fb.innerHTML = `<div style="color: #fbbf24; font-size: 0.88rem; margin-top: 0.4rem;">S > 0 才有剩餘；S = 0 代表已達上限緊迫約束。</div>`;
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

// 百分位數動態尺規微元件驅動 (0.5 乾淨步進)
function initPercentileRulerWidget() {
  const data = [10, 15, 18, 24, 30, 36, 42, 50, 60];
  const n = data.length;
  const slider = document.getElementById("rulerSlider");
  const track = document.getElementById("rulerTrack");
  const pctVal = document.getElementById("rulerPctVal");
  const resBox = document.getElementById("rulerResultBox");

  function update() {
    if (!slider || !track || !resBox || !pctVal) return;
    const L = parseFloat(slider.value); // 乾淨 0.5 步進：1.0, 1.5, ..., 9.0
    const x = ((L - 1) / (n - 1)) * 100;
    const cleanX = Number.isInteger(x) ? x : Math.round(x * 100) / 100;
    pctVal.textContent = `${cleanX}% (L = ${L.toFixed(1)})`;

    const p = Math.floor(L);
    const d = Math.round((L - p) * 10) / 10;
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
      <div class="ruler-cursor-tag">L = ${L.toFixed(1)}</div>
    `;
    track.appendChild(cursor);

    resBox.innerHTML = `
      <div style="color: #38bdf8; margin-bottom: 0.35rem;">
        板書位置推導：\\(L_{${cleanX}} = \\frac{${cleanX}}{100}(9 - 1) + 1 = \\mathbf{${L.toFixed(1)}}\\)
      </div>
      <div style="color: #cbd5e1; margin-bottom: 0.35rem;">
        整數項 \\(p = ${p}\\)（\\(X_{${p}} = ${x_p}\\)），小數項 \\(0.d = ${d.toFixed(1)}\\)（\\(X_{${p < n ? p + 1 : p}} = ${x_p1}\\)）
      </div>
      <div style="color: #34d399; font-weight: 700;">
        線性內插數值：\\(P_{${cleanX}} = ${x_p} + ${d.toFixed(1)} \\times (${x_p1} - ${x_p}) = \\mathbf{${interpVal}}\\)
      </div>
    `;
    renderMath(resBox);
  }

  window.setRulerPos = function (pos) {
    if (!slider) return;
    slider.value = pos;
    update();
  };

  window.stepRuler = function (delta) {
    if (!slider) return;
    let next = Math.round((parseFloat(slider.value) + delta) * 2) / 2;
    if (next < 1.0) next = 1.0;
    if (next > 9.0) next = 9.0;
    slider.value = next;
    update();
  };

  slider.oninput = update;
  slider.onchange = update;
  update();
}

// 雙 0 實驗器驅動
window.adjustDualZero = function (a) {
  const b = 1, c = 2, d = 2;
  const N = a + b + c + d;
  const smc = ((a + d) / N).toFixed(4);
  const jaccard = (d / (b + c + d)).toFixed(4);

  const btns = document.querySelectorAll("#dualZeroButtonsContainer button");
  btns.forEach((btn) => {
    if (parseInt(btn.getAttribute("data-a"), 10) === a) {
      btn.className = "btn btn-primary";
    } else {
      btn.className = "btn btn-secondary";
    }
  });

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

  const btns = document.querySelectorAll("#decisionButtonsContainer button");
  btns.forEach((btn) => {
    if (btn.getAttribute("data-mode") === mode) {
      btn.className = "btn btn-primary";
    } else {
      btn.className = "btn btn-secondary";
    }
  });

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
      <!-- 步驟切換頁籤 (支援全覽、單步檢視，iPad / 手機友善) -->
      <div class="regret-step-tabs">
        <button class="btn btn-sm btn-primary" id="btnRegretAll" onclick="setRegretStepView('all')">📑 兩步完整轉換流程 (全覽)</button>
        <button class="btn btn-sm btn-secondary" id="btnRegretStep1" onclick="setRegretStepView('step1')">第 1 步：原始收益與情境基準</button>
        <button class="btn btn-sm btn-secondary" id="btnRegretStep2" onclick="setRegretStepView('step2')">第 2 步：遺憾計算與決策</button>
      </div>

      <div class="regret-step-container">
        <!-- 第 1 步：原始收益/付償矩陣 -->
        <div class="regret-step-card" id="regretStep1Card">
          <div class="regret-step-header">
            <span class="regret-step-tag">第 1 步</span>
            <span class="regret-step-title">原始收益/付償矩陣（Original Payoff Matrix）</span>
            <div class="regret-step-subtitle">
              先檢視各方案在各景氣情境下的原始獲利，並在直行底部找出<strong>「各情境最佳獲利基準 (Column Max $V_j^*$)」</strong>：
            </div>
          </div>
          <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table class="decision-table">
              <thead>
                <tr>
                  <th>方案 \\ 景氣情境</th>
                  <th>繁榮 (S1)</th>
                  <th>平平 (S2)</th>
                  <th>蕭條 (S3)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700;">方案 A</td>
                  <td class="cell-spotlight">100</td>
                  <td>40</td>
                  <td>-20</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">方案 B</td>
                  <td>70</td>
                  <td class="cell-spotlight">50</td>
                  <td>10</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">方案 C</td>
                  <td>50</td>
                  <td class="cell-spotlight">50</td>
                  <td class="cell-spotlight">40</td>
                </tr>
                <tr class="regret-benchmark-row">
                  <th style="background: rgba(16, 185, 129, 0.18); color: #34d399; font-weight: 700; border-top: 2px solid #10b981;">
                    各情境最佳獲利基準<br>
                    <span style="font-size: 0.78rem; font-weight: normal; color: #a7f3d0;">(Column Max $V_j^*$)</span>
                  </th>
                  <td class="cell-winner" style="font-size: 1.05rem;">
                    $S_1 = \\mathbf{100}$
                    <div style="font-size: 0.74rem; color: #a7f3d0; margin-top: 2px;">$\\max(100, 70, 50)$</div>
                  </td>
                  <td class="cell-winner" style="font-size: 1.05rem;">
                    $S_2 = \\mathbf{50}$
                    <div style="font-size: 0.74rem; color: #a7f3d0; margin-top: 2px;">$\\max(40, 50, 50)$</div>
                  </td>
                  <td class="cell-winner" style="font-size: 1.05rem;">
                    $S_3 = \\mathbf{40}$
                    <div style="font-size: 0.74rem; color: #a7f3d0; margin-top: 2px;">$\\max(-20, 10, 40)$</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="display: none; text-align: right; margin-top: 0.65rem;" id="step1NextPrompt">
            <button class="btn btn-sm btn-primary" onclick="setRegretStepView('step2', true)">前往第 2 步：計算機會損失矩陣 →</button>
          </div>
        </div>

        <!-- 向下轉換引導箭頭 / 轉換公式卡 -->
        <div class="regret-transition-banner" id="regretTransitionBanner">
          <div class="regret-arrow-down">⬇️ 向下轉換引導：各情境基準 $V_j^*$ 減去 該格原始獲利 $V_{ij}$ ⬇️</div>
          <div class="regret-formula-box">
            <span class="regret-formula-title">📐 機會損失（遺憾值）核心定義公式</span>
            $$\\text{機會損失（遺憾值）} = \\text{該情境最高獲利 } V_j^* - \\text{該方案獲利 } V_{ij}$$
            <div class="regret-formula-desc">
              💡 <strong>管理決策哲學</strong>：代表「如果早知道未來是這個情境，我少賺了多少？」（當選到該情境最高獲利方案時遺憾值為 0；若選方案 A 遇蕭條，少賺了 $40 - (-20) = 60$ 萬）。
            </div>
          </div>
        </div>

        <!-- 第 2 步：機會損失矩陣轉換與最大遺憾 -->
        <div class="regret-step-card" id="regretStep2Card">
          <div class="regret-step-header">
            <span class="regret-step-tag regret-step-tag-green">第 2 步</span>
            <span class="regret-step-title">機會損失矩陣轉換與最大遺憾（Regret Matrix & Minimax Selection）</span>
            <div class="regret-step-subtitle">
              將每格計算出的遺憾值填入矩陣，向右列出各方案的<strong>「最大遺憾 (Row Max)」</strong>，最後挑選受傷最輕（遺憾最小）的方案：
            </div>
          </div>
          <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table class="decision-table">
              <thead>
                <tr>
                  <th>機會損失矩陣<br><span style="font-size: 0.76rem; font-weight: normal; color: #94a3b8;">($R_{ij} = V_j^* - V_{ij}$)</span></th>
                  <th>繁榮 (S1)<br><span style="font-size: 0.76rem; color: #34d399;">$V_1^* = 100$</span></th>
                  <th>平平 (S2)<br><span style="font-size: 0.76rem; color: #34d399;">$V_2^* = 50$</span></th>
                  <th>蕭條 (S3)<br><span style="font-size: 0.76rem; color: #34d399;">$V_3^* = 40$</span></th>
                  <th style="background: rgba(99, 102, 241, 0.25); color: #c7d2fe;">方案最大遺憾<br><span style="font-size: 0.76rem; font-weight: normal;">(Row Max)</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700;">方案 A</td>
                  <td><div class="regret-cell-val">0</div><div class="regret-cell-calc">$100 - 100 = 0$</div></td>
                  <td><div class="regret-cell-val">10</div><div class="regret-cell-calc">$50 - 40 = 10$</div></td>
                  <td class="cell-spotlight"><div class="regret-cell-val">60</div><div class="regret-cell-calc">$40 - (-20) = 60$</div></td>
                  <td class="cell-spotlight"><div class="regret-cell-val">60</div><div style="font-size: 0.74rem; color: #94a3b8;">$\\max(0, 10, 60)$</div></td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">方案 B</td>
                  <td class="cell-spotlight"><div class="regret-cell-val">30</div><div class="regret-cell-calc">$100 - 70 = 30$</div></td>
                  <td><div class="regret-cell-val">0</div><div class="regret-cell-calc">$50 - 50 = 0$</div></td>
                  <td class="cell-spotlight"><div class="regret-cell-val">30</div><div class="regret-cell-calc">$40 - 10 = 30$</div></td>
                  <td class="cell-winner"><div class="regret-cell-val">30</div><div style="font-size: 0.74rem; color: #a7f3d0;">$\\max(30, 0, 30)$</div><div style="font-size: 0.74rem; color: #34d399; font-weight: 700;">(最小遺憾 🏆)</div></td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">方案 C</td>
                  <td class="cell-spotlight"><div class="regret-cell-val">50</div><div class="regret-cell-calc">$100 - 50 = 50$</div></td>
                  <td><div class="regret-cell-val">0</div><div class="regret-cell-calc">$50 - 50 = 0$</div></td>
                  <td><div class="regret-cell-val">0</div><div class="regret-cell-calc">$40 - 40 = 0$</div></td>
                  <td class="cell-spotlight"><div class="regret-cell-val">50</div><div style="font-size: 0.74rem; color: #94a3b8;">$\\max(50, 0, 0)$</div></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="regret-decision-banner">
            <div style="font-size: 1.05rem; font-weight: 700; color: #34d399; margin-bottom: 0.35rem;">
              🏆 決策結論：選方案 B（最壞遺憾僅 30 萬）！
            </div>
            <div style="font-size: 0.88rem; color: #e2e8f0; line-height: 1.5;">
              各方案最大遺憾分別為 A: 60 萬、B: 30 萬、C: 50 萬。<br>
              依最大機會損失最小化準則：$$\\min(60, 30, 50) = 30 \\implies \\text{\\textbf{選方案 B}}$$
              雖然方案 B 在各情境都不是第一名，但能確保在任何可能情境下，少賺金額最高不超過 30 萬，是典型「輸得起、最壞情況受傷最輕」的穩健決策！
            </div>
          </div>
          <div style="display: none; text-align: left; margin-top: 0.65rem;" id="step2PrevPrompt">
            <button class="btn btn-sm btn-secondary" onclick="setRegretStepView('step1', true)">← 返回第 1 步原始收益矩陣</button>
          </div>
        </div>
      </div>
    `;
    expBox.innerHTML = "💔 <strong>最大機會損失最小化 (Minimax Regret)</strong>：經歷「第 1 步取各行最大基準 $V_j^*$」$\\to$「轉換公式 $R_{ij} = V_j^* - V_{ij}$」$\\to$「第 2 步各列最大遺憾中取最小 $\\min(60, 30, 50) = 30$」$\\implies$ <strong>選方案 B（最壞遺憾僅 30 萬）</strong>！";
  }

  renderMath(expBox);
  renderMath(tableBox);
};

// 支援機會損失兩步切換 (all, step1, step2)
window.setRegretStepView = function (step, shouldScroll = false) {
  const card1 = document.getElementById("regretStep1Card");
  const banner = document.getElementById("regretTransitionBanner");
  const card2 = document.getElementById("regretStep2Card");
  const btnAll = document.getElementById("btnRegretAll");
  const btn1 = document.getElementById("btnRegretStep1");
  const btn2 = document.getElementById("btnRegretStep2");
  const pNext = document.getElementById("step1NextPrompt");
  const pPrev = document.getElementById("step2PrevPrompt");
  const expBox = document.getElementById("decisionExplanationBox");
  if (!card1 || !card2) return;

  if (step === "step1") {
    card1.style.display = "block";
    if (banner) banner.style.display = "none";
    card2.style.display = "none";
    if (pNext) pNext.style.display = "block";
    if (btnAll) btnAll.className = "btn btn-sm btn-secondary";
    if (btn1) btn1.className = "btn btn-sm btn-primary";
    if (btn2) btn2.className = "btn btn-sm btn-secondary";
    if (expBox) {
      expBox.innerHTML = "📌 <strong>第 1 步：原始收益與情境基準</strong>：在各景氣情境（直行）中找出最佳獲利基準 $V_j^*$（$S_1=\\mathbf{100}, S_2=\\mathbf{50}, S_3=\\mathbf{40}$）。下一步將以此基準扣除各格獲利，換算出「少賺的機會損失」！";
      renderMath(expBox);
    }
    if (shouldScroll) {
      card1.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } else if (step === "step2") {
    card1.style.display = "none";
    if (banner) banner.style.display = "none";
    card2.style.display = "block";
    if (pPrev) pPrev.style.display = "block";
    if (btnAll) btnAll.className = "btn btn-sm btn-secondary";
    if (btn1) btn1.className = "btn btn-sm btn-secondary";
    if (btn2) btn2.className = "btn btn-sm btn-primary";
    if (expBox) {
      expBox.innerHTML = "💔 <strong>第 2 步：機會損失矩陣與決策</strong>：以 $R_{ij} = V_j^* - V_{ij}$ 填妥矩陣，向右找出各方案最大遺憾（A:60, B:30, C:50）。依 $\\min(60, 30, 50) = 30 \\implies$ <strong>選方案 B（最壞遺憾僅 30 萬）</strong>！";
      renderMath(expBox);
    }
    if (shouldScroll) {
      card2.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  } else {
    // all
    card1.style.display = "block";
    if (banner) banner.style.display = "block";
    card2.style.display = "block";
    if (pNext) pNext.style.display = "none";
    if (pPrev) pPrev.style.display = "none";
    if (btnAll) btnAll.className = "btn btn-sm btn-primary";
    if (btn1) btn1.className = "btn btn-sm btn-secondary";
    if (btn2) btn2.className = "btn btn-sm btn-secondary";
    if (expBox) {
      expBox.innerHTML = "💔 <strong>最大機會損失最小化 (Minimax Regret)</strong>：經歷「第 1 步取各行最大基準 $V_j^*$」$\\to$「轉換公式 $R_{ij} = V_j^* - V_{ij}$」$\\to$「第 2 步各列最大遺憾中取最小 $\\min(60, 30, 50) = 30$」$\\implies$ <strong>選方案 B（最壞遺憾僅 30 萬）</strong>！";
      renderMath(expBox);
    }
    if (shouldScroll) {
      card1.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  const tableBox = document.getElementById("decisionTableContainer");
  if (tableBox && typeof renderMath === "function") {
    renderMath(tableBox);
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
    // 選項洗牌 (動態洗牌防死背，依 Blueprint 6.2 實作)
    if (!mcqOptionShuffledCache[originalQ.id]) {
      const copy = [...q.options];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      mcqOptionShuffledCache[originalQ.id] = copy;
    }
    const options = mcqOptionShuffledCache[originalQ.id];
    const displayLetters = ["A", "B", "C", "D", "E"];

    interactiveHtml = `
      <div class="options-container" id="options-${originalQ.id}">
        ${options
          .map((opt, optIdx) => {
            const letter = displayLetters[optIdx] || opt.key;
            const isSelected = qState.lastSelected === opt.key;
            let optClass = "option-btn";
            if (isSelected) {
              optClass += opt.key === q.correctAnswer ? " selected-correct" : " selected-wrong";
            }
            return `
              <div>
                <button class="${optClass}" data-key="${opt.key}" onclick="handleMcqSelect('${originalQ.id}', '${opt.key}')">
                  <span class="option-key">${letter}</span>
                  <span style="flex: 1;">${opt.text}</span>
                </button>
                <div id="distractor-${originalQ.id}-${opt.key}" style="display: ${isSelected && opt.distractorFeedback ? "block" : "none"};">
                  ${opt.distractorFeedback ? `<div class="distractor-feedback">⚠️ 觀念剖析：${opt.distractorFeedback}</div>` : ""}
                </div>
              </div>
            `;
          })
          .join("")}
        ${
          originalQ.hasDynamicGenerator || originalQ.hasDynamic
            ? `<div style="margin-top: 0.75rem;"><button class="btn btn-secondary" onclick="randomizeCardParam('${originalQ.id}', '${originalQ.dynamicType}')" title="防死背：重新換一組數字算算看">🎲 換一組數字</button></div>`
            : ""
        }
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
            originalQ.hasDynamicGenerator || originalQ.hasDynamic
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
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${
              originalQ.hasDynamicGenerator || originalQ.hasDynamic
                ? `<button class="btn btn-secondary" onclick="randomizeCardParam('${originalQ.id}', '${originalQ.dynamicType}')" title="防死背：重新換一組數字算算看">🎲 換一組數字</button>`
                : ""
            }
            <button class="btn btn-secondary" onclick="toggleSolutionBox('${originalQ.id}')">
              🔍 展開 / 摺疊分步推導
            </button>
          </div>
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
  const q = dynamicQuestionCache[qId] || originalQ;

  const isCorrect = selectedKey === q.correctAnswer;
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
      const key = btn.getAttribute("data-key");
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

  // 去除千分位逗點及多餘空白，支援例如 "1,600" 或 "8,640"
  let cleanVal = rawVal.replace(/,/g, "").trim();

  // 支援結尾含百分比符號，例如 "50%" 或 "81.82 %"
  let hasPercentSign = false;
  if (cleanVal.endsWith("%")) {
    hasPercentSign = true;
    cleanVal = cleanVal.slice(0, -1).trim();
  }

  // 支援分數格式輸入 (例如 14/15 或 1,600/2)
  let userNum = NaN;
  if (cleanVal.includes("/")) {
    const parts = cleanVal.split("/");
    if (parts.length === 2) {
      const num = parseFloat(parts[0].trim());
      const den = parseFloat(parts[1].trim());
      if (den !== 0 && !isNaN(num) && !isNaN(den)) {
        userNum = num / den;
      }
    }
  } else {
    userNum = parseFloat(cleanVal);
  }

  if (isNaN(userNum) || !isFinite(userNum)) {
    feedbackEl.innerHTML = `<div style="color: #f43f5e; font-size: 0.88rem;">請輸入合法的數字格式！</div>`;
    return;
  }

  const tol = q.tolerance !== null && q.tolerance !== undefined ? q.tolerance : 0.05;
  let isCorrect = Math.abs(userNum - q.correctAnswer) <= tol;

  // 百分比與比率小數容許轉換 (例如題目單位為 % 且標準答案為 50，若輸入 0.5 亦算正確；反之亦然)
  if (!isCorrect && q.unitLabel === "%") {
    if (q.correctAnswer > 1 && Math.abs(userNum * 100 - q.correctAnswer) <= tol) {
      isCorrect = true;
    } else if (q.correctAnswer <= 1 && Math.abs(userNum / 100 - q.correctAnswer) <= tol) {
      isCorrect = true;
    }
  } else if (!isCorrect && hasPercentSign) {
    if (Math.abs(userNum - q.correctAnswer) <= tol || Math.abs(userNum / 100 - q.correctAnswer) <= tol) {
      isCorrect = true;
    }
  }

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
  const originalQ = RAW_QUESTIONS.find((q) => q.id === qId);
  if (!originalQ) return;

  let dynamicQ = null;
  if (typeof originalQ.generator === "function") {
    dynamicQ = originalQ.generator(originalQ);
  } else if (typeof generateDynamicQuestion === "function") {
    dynamicQ = generateDynamicQuestion(dynamicType || originalQ.dynamicType, originalQ);
  }
  if (!dynamicQ) return;

  // 確保 prompt 與 questionPrompt 同步兼容
  if (dynamicQ.prompt && !dynamicQ.questionPrompt) {
    dynamicQ.questionPrompt = dynamicQ.prompt;
  }
  if (dynamicQ.questionPrompt && !dynamicQ.prompt) {
    dynamicQ.prompt = dynamicQ.questionPrompt;
  }

  const merged = { ...originalQ, ...dynamicQ };
  dynamicQuestionCache[qId] = merged;

  // 徹底重置作答狀態為未作答，讓使用者有機會在新題目贏得 🟢 已精通
  StudyStorage.updateQuestionState(qId, {
    status: "unattempted",
    userAttempts: 0,
    lastSelected: null,
    hintViewed: false
  });
  delete mcqOptionShuffledCache[qId];

  // 取得原卡片在當前階梯中的題目序號 indexNum
  let indexNum = 1;
  const filtered = RAW_QUESTIONS.filter((q) => q.unit === originalQ.unit && q.level === originalQ.level);
  const foundIdx = filtered.findIndex((q) => q.id === qId);
  if (foundIdx !== -1) {
    indexNum = foundIdx + 1;
  }

  // 局部重新繪製卡片
  const oldCard = document.getElementById(`card-${qId}`);
  if (oldCard) {
    const newCard = createQuestionCard(merged, originalQ, indexNum);
    oldCard.replaceWith(newCard);
    renderMath(newCard);
  }

  updateProgressUI();
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
      mcqOptionShuffledCache = {};
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
