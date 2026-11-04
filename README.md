# 商業分析（BA）互動複習系統 — BA Study Studio

> **專案狀態**：🚀 已完整建置完成並通過測試  
> **線上存儲庫**：`https://github.com/markyang20040112-source/study-studio.git`  
> **核心架構**：純前端零構建單頁應用（Vanilla JS + CSS3 + KaTeX CDN），支援本機雙擊開啟、離線執行、平板與手機自適應排版、以及 GitHub Pages 一鍵部署。

---

## 一、 系統亮點功能

1. **四層階梯式學習架構 + Level 0 觀念互動探索**：
   - **Level 0 觀念探索**：商業情境 Why this matters 起手式、公式視覺拆解、觀念快速 Checkpoint。
     - 包含 **SMC vs Jaccard 雙 0 實驗器**（直觀呈現海量未買項目使 SMC 虛高 0.99 的過程，體悟「拿掉 a」的精髓）。
     - 包含 **板書標準百分位數動態尺規**（依課堂板書 $L_x = \frac{x}{100}(n-1)+1$ 與線性內插動態游標展示）。
     - 包含 **決策準則心態視覺化矩陣**（Maximax, Maximin, Laplace, Minimax Regret 聚焦點亮光圈）。
   - **Level 1 觀念核心選擇題**：100% 選擇題，配備「干擾項深度對比反饋」（選錯立即指出觀念盲點）。
   - **Level 2 基礎手算快打題**：附「Given Data 獨立卡片」（加大等寬粗體字型），單公式直代，支援輸入容許誤差。
   - **Level 3 綜合進階實戰題**：貝氏定理條件更新、LP 極小化圖解求頂點與超額變數、敏感度斜率夾擠、機會損失矩陣。
   - **Level 4 作業魔王題型變形題**：科學園區三廠區公平限水比例限制式建模（連比例交叉相乘化為標準線性約束）、LP 軸截距敏感度反推、作業 1107 題三四策略報酬矩陣四準則綜合求解、企3B 作業兩階段分店試驗貝氏定理全機率逆向更新（決策樹與 EVSI 超綱嚴格排除）。

2. **防死背與自適應刷題機制**：
   - **動態參數隨機化引擎 (Dynamic Parameter Randomization)**：手算打底題提供「🎲 換一組數字」功能，動態微調參數，防止死背答案數字。
   - **通用符號虛擬晶片 (Universal Symbol Palette)**：提供豐富符號晶片點擊輸入，防止選項洩漏答案。
   - **選項隨機洗牌 (Option Shuffling)**：選擇題每次進入隨機洗牌選項順序。
   - **誠實引導機制 (Progressive Hints)**：點擊「💡 提示公式 (Peek Formula)」自動將該題標記為 🟡（需加強）。

3. **三色掌握度追蹤與備份 (HTML5 LocalStorage)**：
   - ⚪ **未作答 (Unattempted)**
   - 🟡 **需加強 (Review Needed)**（答錯、看提示或點擊書籤 ★）
   - 🟢 **已精通 (Mastered)**（初次未看提示直接答對）
   - 全單元掌握度條狀圖、全域環形精通百分比、進度 JSON 備份匯出與匯入。

4. **衝刺救急與弱點專攻模式**：
   - 🎯 **弱點清剿模式 (Focus Weakness Mode)**：一鍵篩選並連續推播所有 🟡 錯題。
   - ⚡ **考前衝刺救急包 (Quick Cram Mode)**：進考場前 30 分鐘，一鍵彙整所有卡關錯題對應之核心速記口訣與必背公式。

---

## 二、 檔案結構說明

```
ba-study-studio/
│
├── index.html                  # 應用程式單頁主框架 (SPA Layout)
│
├── css/
│   ├── main.css                # 核心主題色變數 (Slate/Indigo/Emerald)、雙欄排版 (>=1024px)、48px 觸控熱區
│   ├── components.css          # 按鈕、掌握度徽章、Given Data 卡片、選擇題選項、符號工具列、彈窗
│   └── math.css                # KaTeX 數學公式容器、百分位數動態尺規軸、決策準則聚焦點亮樣式
│
├── js/
│   ├── app.js                  # 狀態管理、DOM 渲染、Level 0 互動微元件、作答判斷、救急包與儀表板
│   ├── storage.js              # HTML5 localStorage (BA_STUDY_PROGRESS_V1) 讀寫、掌握度統計、JSON 備份
│   └── questions.js            # 完整題庫資料庫 (含 6 大單元 Level 1-4 全部題目與動態隨機生成器)
│
├── EXAM_KNOWLEDGE_BASE.md      # 考試核心知識庫完整歸納（含官方筆誤勘誤）
├── QUESTION_BANK_LEVEL1_TO_4.md # 四層題庫與步驟詳解 (共56題)
├── WEB_APP_BLUEPRINT.md        # 系統藍圖規格書 (含最新 6.7 互動與輸入規格)
├── course_materials/           # 原始教材歸檔（投影片、作業、筆記照片、PDF講義）
│
├── README.md                   # 專案介紹與部署指引
└── .gitignore                  # Git 忽略檔
```

---

## 三、 本地啟動與部署指引

### 3.1 本地預覽測試

本系統為純靜態網頁，無需安裝 Node.js 或執行任何 `npm build`。

- **方法一（直接開啟）**：雙擊 `index.html` 即可在任一瀏覽器（Chrome、Edge、Safari）開啟作答。
- **方法二（本地 HTTP 伺服器）**：
  ```bash
  # Python 啟動（推薦）
  python -m http.server 8000
  
  # 或使用 npx
  npx serve .
  ```
  瀏覽器打開 `http://localhost:8000` 即可訪問。

### 3.2 部署至 GitHub Pages

1. 提交所有檔案至本地 Git：
   ```bash
   git add .
   git commit -m "feat: complete interactive BA study studio web application"
   ```
2. 推送至 GitHub 遠端倉庫：
   ```bash
   git remote add origin https://github.com/markyang20040112-source/study-studio.git
   git branch -M main
   git push -u origin main
   ```
3. 啟用 GitHub Pages：
   - 進入 GitHub 專案頁面 $\to$ `Settings` $\to$ `Pages`。
   - 在 `Build and deployment` 下的 `Source` 選擇 `Deploy from a branch`。
   - Branch 選擇 `main`，資料夾選擇 `/ (root)`，點擊 `Save`。
   - 約 30 秒至 1 分鐘後，即可透過 `https://markyang20040112-source.github.io/study-studio/` 在手機與平板上隨時刷題！
