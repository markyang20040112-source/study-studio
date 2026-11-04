/**
 * 商業分析 (Business Analytics) 題庫系統
 * 階梯式四層題目資料庫 (Level 1 ~ Level 4)
 * 涵蓋 6 大學習單元，嚴格符合板書與知識庫標準：
 * - Ch 6.3 羅吉斯迴歸 100% 排除
 * - 百分位數採用板書唯一標準：L_x = (x / 100) * (n - 1) + 1 搭配線性內插
 * - 具備動態參數產生器 (Dynamic Parameter Randomization) 防止死背
 */

const UNITS = [
  {
    id: "ch02-descriptive",
    name: "單元一：敘述統計與成長率",
    shortName: "敘述統計",
    icon: "📊",
    desc: "幾何平均數 (CAGR)、板書百分位數公式與離散度度量 (CV)"
  },
  {
    id: "ch02-similarity",
    name: "單元二：距離與相似度度量",
    shortName: "相似度度量",
    icon: "🎯",
    desc: "二元列聯表、SMC 簡單匹配係數 vs Jaccard 雅卡爾指數"
  },
  {
    id: "ch03-probability",
    name: "單元三：機率論與貝氏定理",
    shortName: "機率與貝氏",
    icon: "🎲",
    desc: "條件機率、全機率定理、貝氏逆向更新與隨機變數分配概論"
  },
  {
    id: "ch06-regression",
    name: "單元四：迴歸分析與交互作用",
    shortName: "迴歸分析",
    icon: "📈",
    desc: "最小平方法、R² 解釋力陷阱、p-value 與交互作用非平行效應"
  },
  {
    id: "ch10-lp",
    name: "單元五：線性規劃與敏感度分析",
    shortName: "線性規劃",
    icon: "📐",
    desc: "圖解法求頂點、差額/超額變數、敏感度斜率夾擠與公平比例限制式"
  },
  {
    id: "ch13-decision",
    name: "單元六：不確定情況下之決策準則",
    shortName: "決策分析",
    icon: "⚖️",
    desc: "13.2 不確定決策準則：樂觀(Maximax)、悲觀(Maximin)、Laplace、最大機會損失最小化(Minimax Regret) 與報酬矩陣"
  }
];

const RAW_QUESTIONS = [
  // ==========================================
  // 單元一：敘述統計與成長率 (ch02-descriptive)
  // ==========================================
  {
    id: "q-u1-l1-01",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 1,
    type: "mcq",
    title: "幾何平均數與複合年成長率觀念",
    questionPrompt: "某公司欲評估近五年之營收複合年成長率，若該期間內各年度營收成長率分別為 $+20\\%$, $-10\\%$, $+15\\%$, $+5\\%$。下列何者為採用幾何平均數而非算術平均數的核心原因？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "算術平均數計算過於繁瑣，幾何平均數計算較簡便",
        distractorFeedback: "幾何平均數需連乘開根號，計算上遠比算術平均數複雜。因此計算繁簡並非主要考量。"
      },
      {
        key: "B",
        text: "各期成長具有複利累乘效應，若使用算術平均數會高估實質長期平均成長率",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "幾何平均數不受極端值影響，而算術平均數會被極端值嚴重拉扯",
        distractorFeedback: "中位數才具有耐受極端值的穩健性；幾何平均數依然會受極端值嚴重影響。"
      },
      {
        key: "D",
        text: "只有在所有成長率皆為正值時才能使用算術平均數",
        distractorFeedback: "算術平均數在數值為負時依然可計算，只是其經濟意涵已被扭曲。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "CAGR = \\sqrt[t]{\\frac{V_t}{V_0}} - 1 = \\left( \\frac{V_t}{V_0} \\right)^{1/t} - 1",
    fullSolution: "【步驟一：觀念辨析】跨期成長率具有前後期累乘的複利結構 (1+R1)(1+R2)...。\n【步驟二：數學證明】根據柯西不等式與算幾不等式，算術平均數 ≥ 幾何平均數。若直接用算術平均數相加除以期數，會忽略前期規模縮水對後期的影響，必定高估實質長期複合年成長率！\n【步驟三：結論】評估跨期複利時必須使用幾何平均數。",
    cramSummary: {
      conceptName: "幾何平均數 (CAGR)",
      keyTakeaway: "算術平均必高估成長率！跨期複利計算務必採用幾何平均開 t 次方根。"
    }
  },
  {
    id: "q-u1-l1-02",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 1,
    type: "mcq",
    title: "課堂板書百分位數位置公式辨析",
    questionPrompt: "在計算一組由小至大排序後的數列（樣本數為 $n$）之第 $x$ 百分位數時，本課程課堂板書所明載的「唯一標準位置計算公式」為何？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "$L_x = \\frac{x}{100} \\times n$",
        distractorFeedback: "這是某些簡易概算法，但未考量起點坐標為 1，不符合課堂板書標準。"
      },
      {
        key: "B",
        text: "$L_x = \\frac{x}{100} \\times (n - 1) + 1$",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "$L_x = \\frac{x}{100} \\times (n + 1)$",
        distractorFeedback: "這是舊版教科書或少數統計軟體公式（投影片 Slide 31 筆誤處即在此），課堂板書 IMG_0130 明確規定採 (n-1)+1。"
      },
      {
        key: "D",
        text: "$L_x = \\frac{x}{100} \\times (n + 1) - 1$",
        distractorFeedback: "此公式純屬拼湊，並無此統計學規範。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "L_x = \\frac{x}{100} \\times (n - 1) + 1",
    fullSolution: "【步驟一：板書對齊】課堂板書 IMG_0130 唯一指定採用公式：$L_x = \\frac{x}{100}(n-1) + 1$。\n【步驟二：幾何意涵】第一筆資料坐標為 1，最後一筆坐標為 n，總跨距為 $n-1$。依百分比 $x/100$ 切割後加上起點 1 即為精確位置。\n【步驟三：內插法】若算得小數 $p.d$，則以 $X_p + 0.d(X_{p+1} - X_p)$ 進行線性內插。",
    cramSummary: {
      conceptName: "板書百分位數公式",
      keyTakeaway: "位置公式唯一死守：L_x = (x/100)(n-1) + 1！內插公式：X_p + 0.d(X_{p+1} - X_p)。"
    }
  },
  {
    id: "q-u1-l1-03",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 1,
    type: "mcq",
    title: "變異係數 (CV) 之商務應用特性",
    questionPrompt: "某跨國投資機構欲比較「台灣加權指數（點數約 20,000 點）」與「某美股個股（股價約 50 美元）」近一年的波動離散程度。分析師應優先選用何種統計量進行客觀比較？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "樣本標準差 (Standard Deviation)，因其數值具備絕對直觀性",
        distractorFeedback: "標準差帶有原始衡量單位（點數 vs 美元），且兩者平均數基期差距上萬倍，直接比標準差毫無意義。"
      },
      {
        key: "B",
        text: "樣本變異數 (Variance)，因其能放大極端波動的衝擊",
        distractorFeedback: "變異數帶有單位的平方，更無法跨單位與跨平均數進行跨界比較。"
      },
      {
        key: "C",
        text: "變異係數 (CV = S / X̄)，因其消除衡量單位與平均數規模差異，屬純量相對指標",
        distractorFeedback: null
      },
      {
        key: "D",
        text: "四分位距 (IQR)，因其專門度量平均數相差極大的資產",
        distractorFeedback: "IQR 依然具有原始測量單位，不能消除單位與規模的影響。"
      }
    ],
    correctAnswer: "C",
    formulaHint: "CV = \\frac{S}{\\bar{X}} \\times 100\\%",
    fullSolution: "【步驟一：公式定義】變異係數 $CV = S / \\bar{X}$。\n【步驟二：統計特性】透過將標準差除以平均數，消除了測量單位（台幣點數 vs 美元）與尺度規模（20,000 vs 50）的影響，轉換為無因次的純量相對離散度。\n【步驟三：商務結論】評估不同單位或平均數差異巨大的兩組資產波動風險時，CV 為唯一標準指標。",
    cramSummary: {
      conceptName: "變異係數 (CV)",
      keyTakeaway: "CV = S / X̄，無單位純量！專門解決「不同單位」或「平均數差距極大」的相對波動比較。"
    }
  },
  {
    id: "q-u1-l2-01",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 2,
    type: "numeric",
    title: "幾何平均年增率計算",
    questionPrompt: "某連鎖手搖飲品牌的年營收在民國 108 年為 1,600 萬元，至民國 112 年成長為 8,100 萬元（期間歷經 4 個成長跨期）。請計算該品牌這 4 年間營收年增加率的幾何平均數（%）。",
    givenData: {
      "期初營收 V0": "1,600 萬元",
      "期末營收 Vt": "8,100 萬元",
      "跨越期數 t": "4 年 (112 - 108)"
    },
    options: null,
    correctAnswer: 50,
    unitLabel: "%",
    tolerance: 0.1,
    formulaHint: "CAGR = \\left( \\frac{V_t}{V_0} \\right)^{1/t} - 1",
    fullSolution: "【步驟一：整理已知數據】$V_0 = 1600$, $V_t = 8100$, $t = 112 - 108 = 4$。\n【步驟二：列出公式】$CAGR = (V_t / V_0)^{1/t} - 1 = (8100 / 1600)^{1/4} - 1$。\n【步驟三：逐步計算】\n$(81 / 16)^{1/4} = [(3/2)^4]^{1/4} = 3/2 = 1.5$。\n$CAGR = 1.5 - 1 = 0.5 = 50\\%$。\n【步驟四：最終結論】年增率幾何平均數為 50%。",
    cramSummary: {
      conceptName: "CAGR 開方求解",
      keyTakeaway: "CAGR = (Vt / V0)^(1/t) - 1。注意期數 t = 終期年份 - 初期年份。"
    },
    hasDynamicGenerator: true,
    dynamicType: "cagr"
  },
  {
    id: "q-u1-l2-02",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 2,
    type: "numeric",
    title: "板書標準百分位數位置與內插求解",
    questionPrompt: "現有一組包含 9 筆顧客滿意度評分數據（已由小至大排序）：\n`10, 15, 18, 24, 30, 36, 42, 50, 60`（$n = 9$）。\n請依課堂板書公式求出「第 70 百分位數對應之數值」。",
    givenData: {
      "排序數列": "[10, 15, 18, 24, 30, 36, 42, 50, 60]",
      "樣本數 n": "9",
      "目標百分位 x": "70"
    },
    options: null,
    correctAnswer: 39.6,
    unitLabel: "分",
    tolerance: 0.05,
    formulaHint: "L_x = \\frac{x}{100}(n - 1) + 1, \\quad P_x = X_p + 0.d(X_{p+1} - X_p)",
    fullSolution: "【步驟一：求位置 L70】\n$L_{70} = \\frac{70}{100} \\times (9 - 1) + 1 = 0.70 \\times 8 + 1 = 5.6 + 1 = 6.6$。\n位置整數項 $p = 6$，小數項 $0.d = 0.6$。\n【步驟二：找出相鄰數據】\n第 6 筆數據 $X_6 = 36$；第 7 筆數據 $X_7 = 42$。\n【步驟三：線性內插】\n$P_{70} = X_6 + 0.6 \\times (X_7 - X_6) = 36 + 0.6 \\times (42 - 36) = 36 + 0.6 \\times 6 = 36 + 3.6 = 39.6$。\n【步驟四：最終結論】第 70 百分位數值為 39.6。",
    cramSummary: {
      conceptName: "板書百分位內插",
      keyTakeaway: "位置：0.70*(9-1)+1 = 6.6。內插：X6 + 0.6*(X7 - X6) = 36 + 0.6*6 = 39.6。"
    },
    hasDynamicGenerator: true,
    dynamicType: "percentile"
  },
  {
    id: "q-u1-l2-03",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 2,
    type: "numeric",
    title: "樣本標準差與變異係數 (CV) 計算",
    questionPrompt: "某工廠抽驗 5 批零件的重量（公克）分別為：`18, 19, 20, 21, 22`。請計算該樣本之「變異係數 CV（%）」（請四捨五入至小數點後兩位）。",
    givenData: {
      "樣本數值": "[18, 19, 20, 21, 22]",
      "樣本數 n": "5"
    },
    options: null,
    correctAnswer: 7.91,
    unitLabel: "%",
    tolerance: 0.1,
    formulaHint: "\\bar{X} = \\frac{\\sum X_i}{n}, \\quad S = \\sqrt{\\frac{\\sum (X_i - \\bar{X})^2}{n - 1}}, \\quad CV = \\frac{S}{\\bar{X}} \\times 100\\%",
    fullSolution: "【步驟一：平均數】$\\bar{X} = (18+19+20+21+22)/5 = 100/5 = 20$。\n【步驟二：離均差平方和】$\\sum (X_i - 20)^2 = (-2)^2 + (-1)^2 + 0^2 + 1^2 + 2^2 = 4 + 1 + 0 + 1 + 4 = 10$。\n【步驟三：樣本標準差】分母除以 $n-1=4$：$S^2 = 10 / 4 = 2.5 \\implies S = \\sqrt{2.5} \\approx 1.5811$。\n【步驟四：變異係數】$CV = S / \\bar{X} = 1.5811 / 20 = 0.079057 \\approx 7.91\\%$。",
    cramSummary: {
      conceptName: "樣本標準差與 CV",
      keyTakeaway: "樣本標準差分母除以 n-1！CV = S / X̄ * 100%。"
    },
    hasDynamicGenerator: true,
    dynamicType: "cv"
  },
  {
    id: "q-u1-l3-01",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 3,
    type: "numeric",
    title: "複合年成長率逆推目標期末值",
    questionPrompt: "某電商平台當前年營收（第 0 年）為 5,000 萬元。董事會設定未來 3 年的目標複合年成長率（CAGR）需達到 20%。請問該平台在第 3 年年末必須達成多少營收規模（萬元）？",
    givenData: {
      "初期營收 V0": "5,000 萬元",
      "目標 CAGR": "20% (0.20)",
      "規劃期數 t": "3 年"
    },
    options: null,
    correctAnswer: 8640,
    unitLabel: "萬元",
    tolerance: 1,
    formulaHint: "V_t = V_0 \\times (1 + CAGR)^t",
    fullSolution: "【步驟一：公式逆推】\n由 $CAGR = (V_t / V_0)^{1/t} - 1$，兩邊加 1 後取 $t$ 次方得：\n$V_t = V_0 \\times (1 + CAGR)^t$。\n【步驟二：數值代入】\n$V_3 = 5000 \\times (1 + 0.20)^3 = 5000 \\times (1.20)^3$。\n【步驟三：計算展開】\n$1.20^3 = 1.728$。\n$V_3 = 5000 \\times 1.728 = 8,640$ 萬元。\n【步驟四：結論】第 3 年年末營收必須達到 8,640 萬元。",
    cramSummary: {
      conceptName: "CAGR 逆推終期目標",
      keyTakeaway: "Vt = V0 * (1 + CAGR)^t。連乘 1.2^3 = 1.728，乘 5000 得 8640。"
    }
  },
  {
    id: "q-u1-l3-02",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 3,
    type: "numeric",
    title: "板書標準四分位距 (IQR) 綜合求解",
    questionPrompt: "現有一組排序後的 9 筆數據：`12, 18, 22, 28, 35, 42, 58, 65, 80`（$n = 9$）。請依課堂板書公式計算其第 1 四分位數 $Q_1$ 與第 3 四分位數 $Q_3$，並求出四分位距 $IQR = Q_3 - Q_1$。",
    givenData: {
      "排序數列": "[12, 18, 22, 28, 35, 42, 58, 65, 80]",
      "樣本數 n": "9"
    },
    options: null,
    correctAnswer: 36,
    unitLabel: "",
    tolerance: 0.1,
    formulaHint: "L_{25} = 0.25(n - 1) + 1, \\quad L_{75} = 0.75(n - 1) + 1, \\quad IQR = Q_3 - Q_1",
    fullSolution: "【步驟一：求 Q1 (第 25 百分位數)】\n$L_{25} = 0.25 \\times (9 - 1) + 1 = 0.25 \\times 8 + 1 = 2 + 1 = 3.0$（整數位置！）。\n$Q_1 = X_3 = 22$。\n【步驟二：求 Q3 (第 75 百分位數)】\n$L_{75} = 0.75 \\times (9 - 1) + 1 = 0.75 \\times 8 + 1 = 6 + 1 = 7.0$（整數位置！）。\n$Q_3 = X_7 = 58$。\n【步驟三：求四分位距 IQR】\n$IQR = Q_3 - Q_1 = 58 - 22 = 36$。\n【步驟四：商務結論】中間 50% 核心資料的離散跨度為 36。",
    cramSummary: {
      conceptName: "四分位距 IQR",
      keyTakeaway: "IQR = Q3 - Q1 = P75 - P25。依板書公式先算位置 L25 與 L75 再求值相減：58 - 22 = 36。"
    }
  },
  {
    id: "q-u1-l4-01",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 4,
    type: "self-check",
    title: "各期年增率幾何平均 vs 算術平均深度對比",
    questionPrompt: "某新創生技公司成立 4 年，初期資本額為 1,000 萬元。各年成長率依序為：第 1 年 $+100\\%$、第 2 年 $-50\\%$、第 3 年 $+100\\%$、第 4 年 $-50\\%$。\n請回答：\n(1) 4 年後公司的最終資本額為何？\n(2) 這 4 年間的「算術平均年成長率」為何？\n(3) 這 4 年間的「幾何平均年成長率 (CAGR)」為何？並從商務角度解讀兩者的極大差異。",
    givenData: {
      "初期資本額 V0": "1,000 萬元",
      "各年成長率": "[+100%, -50%, +100%, -50%]"
    },
    formulaHint: "\\bar{R}_{arith} = \\frac{\\sum R_i}{t}, \\quad 1 + \\bar{R}_g = \\sqrt[t]{\\prod (1 + R_i)}",
    fullSolution: "【第一步：手算各年資本額變化】\n- 第 1 年底：$1000 \\times (1 + 1.0) = 2,000$ 萬元。\n- 第 2 年底：$2000 \\times (1 - 0.5) = 1,000$ 萬元。\n- 第 3 年底：$1000 \\times (1 + 1.0) = 2,000$ 萬元。\n- 第 4 年底：$2000 \\times (1 - 0.5) = 1,000$ 萬元。\n最終資本額依然為 1,000 萬元（完全回到原點，淨利潤為 0）。\n\n【第二步：算術平均成長率】\n$\\bar{R}_{arith} = \\frac{100\\% + (-50\\%) + 100\\% + (-50\\%)}{4} = \\frac{100\\%}{4} = +25\\%$。\n若相信算術平均，會誤以為公司每年平均大賺 25%！\n\n【第三步：幾何平均成長率 (CAGR)】\n$1 + \\bar{R}_g = \\sqrt[4]{(1 + 1.0)(1 - 0.5)(1 + 1.0)(1 - 0.5)} = \\sqrt[4]{2.0 \\times 0.5 \\times 2.0 \\times 0.5} = \\sqrt[4]{1.0} = 1.0$。\n$\\bar{R}_g = 1.0 - 1 = 0\\%$。\n亦可直接由期初期末法驗算：$CAGR = (1000 / 1000)^{1/4} - 1 = 0\\%$。\n\n【第四步：商務解讀】\n算術平均數嚴重忽視前期虧損 50% 需靠後期 100% 才能回本的非對稱特性，導致得出虛胖的 +25%；唯有幾何平均數能真實反映資本毫無增長的客觀事實 (0%)。",
    cramSummary: {
      conceptName: "算術 vs 幾何平均對照",
      keyTakeaway: "連乘 (1+R) 才能反映複利現實。+100% 配 -50% 實質成長為 0%，算術平均卻會給出虛偽的 +25%！"
    }
  },

  {
    id: "q-u1-l4-02",
    unit: "ch02-descriptive",
    unitName: "敘述統計與成長率",
    level: 4,
    type: "numeric",
    title: "綜合敘述統計手算：變異數、標準差與變異係數 (CV)",
    questionPrompt: "某半導體晶圓廠檢驗 6 片晶圓的表面厚度微米數（已由小至大排序）：\n`[48, 50, 52, 54, 56, 58]`（$n = 6$）。品管經理欲評估該製程的離散程度。\n請依序手算：\n(1) 樣本平均數 $\\bar{X}$\n(2) 離均差平方和 $\\sum (X_i - \\bar{X})^2$\n(3) 樣本變異數 $S^2$（注意自由度除以 $n - 1$）\n(4) 樣本標準差 $S = \\sqrt{S^2}$\n(5) 變異係數 $CV = \\frac{S}{\\bar{X}} \\times 100\\%$\n請輸入此樣本之「變異係數 CV（%）」（請四捨五入至小數點後兩位）。",
    givenData: {
      "排序數列": "[48, 50, 52, 54, 56, 58]",
      "樣本數 n": "6"
    },
    options: null,
    correctAnswer: 7.06,
    unitLabel: "%",
    tolerance: 0.05,
    formulaHint: "S^2 = \\frac{\\sum (X_i - \\bar{X})^2}{n - 1}, \\quad S = \\sqrt{S^2}, \\quad CV = \\frac{S}{\\bar{X}} \\times 100\\%",
    fullSolution: "【步驟一：計算樣本平均數】\n$\\bar{X} = \\frac{48 + 50 + 52 + 54 + 56 + 58}{6} = \\frac{318}{6} = 53.0$ 微米。\n\n【步驟二：計算各點離均差與平方和】\n- $(48 - 53)^2 = (-5)^2 = 25$\n- $(50 - 53)^2 = (-3)^2 = 9$\n- $(52 - 53)^2 = (-1)^2 = 1$\n- $(54 - 53)^2 = (+1)^2 = 1$\n- $(56 - 53)^2 = (+3)^2 = 9$\n- $(58 - 53)^2 = (+5)^2 = 25$\n離均差平方和 $\\sum (X_i - \\bar{X})^2 = 25 + 9 + 1 + 1 + 9 + 25 = 70$。\n\n【步驟三：計算樣本變異數 (自由度除以 n - 1)】\n$S^2 = \\frac{70}{6 - 1} = \\frac{70}{5} = 14.0$。\n\n【步驟四：計算樣本標準差】\n$S = \\sqrt{14} \\approx 3.74166$ 微米。\n\n【步驟五：計算變異係數 CV】\n$CV = \\frac{S}{\\bar{X}} = \\frac{3.74166}{53.0} \\approx 0.070597 = 7.06\\%$。\n\n【商務意涵】CV 消除平均數尺度影響，僅約 7.06%，製程相對穩定。",
    cramSummary: {
      conceptName: "綜合敘述統計計算全流程",
      keyTakeaway: "樣本變異數除以 n-1（此題 70/5=14）。標準差開根號為 3.7417。CV = S/X̄ = 7.06%。"
    }
  },

  // ==========================================
  // 單元二：距離與相似度度量 (ch02-similarity)
  // ==========================================
  {
    id: "q-u2-l1-01",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 1,
    type: "mcq",
    title: "SMC 與 Jaccard 指數核心選用依據",
    questionPrompt: "在分析大型量販店會員的購物籃二元特徵（1 表購買，0 表未購買）時，資料呈現高度稀疏（Sparse）。若欲度量兩位會員的購物偏好相似度，為何應採用雅卡爾指數（Jaccard Index）而非簡單匹配係數（SMC）？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "Jaccard 指數能同時考量兩位顧客「皆未購買（0-0）」項目的共同喜好",
        distractorFeedback: "考反了！Jaccard 的核心正是排除 0-0 負匹配。"
      },
      {
        key: "B",
        text: "SMC 會將「皆未購買（0-0）」計入分子，海量未買項目會使相似度虛高接近 1",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "Jaccard 指數的數值範圍為 [-1, +1]，比 SMC 的 [0, 1] 更具區分力",
        distractorFeedback: "Jaccard 與 SMC 的數值範圍皆為 [0, 1]。"
      },
      {
        key: "D",
        text: "SMC 只能處理連續型數據，無法處理二元屬性",
        distractorFeedback: "SMC 本身就是專為二元屬性設計的係數。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "SMC = \\frac{a + d}{a + b + c + d}, \\quad Jaccard = \\frac{d}{b + c + d} = \\frac{d}{N - a}",
    fullSolution: "【步驟一：板書核心】板書 IMG_0131 特別註記：「拿掉 a：當 a 這筆資料不重要時，使用雅卡爾指數！」\n【步驟二：列聯表結構】$a$ 為雙 0（兩者皆無），$d$ 為雙 1（兩者皆有）。超市商品有數萬種，任兩位顧客共同未買的商品數 $a$ 極為龐大。若使用 SMC，分子包含 $a$，將導致幾乎所有人的相似度都高達 0.99，失去分群鑑別度。\n【步驟三：Jaccard 優勢】Jaccard 分母與分子皆排除 $a$，聚焦於有購買行為的聯集與交集比例。",
    cramSummary: {
      conceptName: "Jaccard 排除雙 0 原理",
      keyTakeaway: "板書口訣：拿掉 a！當雙 0 不重要或資料極稀疏時，必用 Jaccard 避免相似度虛高。"
    }
  },
  {
    id: "q-u2-l2-01",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 2,
    type: "numeric",
    title: "SMC 簡單匹配係數手算",
    questionPrompt: "比對兩位消費者在 10 項推薦商品上的購買紀錄（1 為購買，0 為未購買）：\n- 消費者甲：`1, 1, 0, 0, 1, 0, 0, 0, 0, 1`\n- 消費者乙：`1, 0, 1, 0, 1, 0, 0, 0, 0, 0`\n請計算兩位消費者之間的簡單匹配係數 SMC（以小數表示，如 0.70）。",
    givenData: {
      "商品總數 N": "10",
      "甲的購買向量": "[1, 1, 0, 0, 1, 0, 0, 0, 0, 1]",
      "乙的購買向量": "[1, 0, 1, 0, 1, 0, 0, 0, 0, 0]"
    },
    options: null,
    correctAnswer: 0.70,
    unitLabel: "",
    tolerance: 0.02,
    formulaHint: "SMC = \\frac{a + d}{N} = \\frac{\\text{雙0} + \\text{雙1}}{N}",
    fullSolution: "【步驟一：逐項比對 10 個商品】\n- 商品 1: (1, 1) -> 雙1 (d)\n- 商品 2: (1, 0) -> 甲1乙0 (c)\n- 商品 3: (0, 1) -> 甲0乙1 (b)\n- 商品 4: (0, 0) -> 雙0 (a)\n- 商品 5: (1, 1) -> 雙1 (d)\n- 商品 6, 7, 8, 9: 均為 (0, 0) -> 4 個雙0 (a)\n- 商品 10: (1, 0) -> 甲1乙0 (c)\n【步驟二：統計次數】\n雙0項目 a = 1 + 4 = 5；雙1項目 d = 2；甲0乙1 b = 1；甲1乙0 c = 2。\n總項目數 N = 5 + 1 + 2 + 2 = 10。\n【步驟三：代入 SMC 公式】\n$SMC = \\frac{a + d}{N} = \\frac{5 + 2}{10} = \\frac{7}{10} = 0.70$。",
    cramSummary: {
      conceptName: "SMC 匹配係數計算",
      keyTakeaway: "SMC = (a + d) / N = (雙0 + 雙1) / 總數。此處 (5 + 2) / 10 = 0.70。"
    },
    hasDynamicGenerator: true,
    dynamicType: "smc_jaccard"
  },
  {
    id: "q-u2-l2-02",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 2,
    type: "numeric",
    title: "Jaccard 雅卡爾指數手算",
    questionPrompt: "承接上題資料（商品總數 $N = 10$，雙 0 數 $a = 5$、甲 0 乙 1 數 $b = 1$、甲 1 乙 0 數 $c = 2$、雙 1 數 $d = 2$）。請計算兩人之雅卡爾指數（Jaccard Index）。",
    givenData: {
      "雙0次數 a": "5",
      "甲0乙1次數 b": "1",
      "甲1乙0次數 c": "2",
      "雙1次數 d": "2"
    },
    options: null,
    correctAnswer: 0.40,
    unitLabel: "",
    tolerance: 0.02,
    formulaHint: "Jaccard = \\frac{d}{b + c + d} = \\frac{d}{N - a}",
    fullSolution: "【步驟一：確認公式】\nJaccard 排除雙 0 負匹配 $a$，公式為：\n$Jaccard = \\frac{d}{b + c + d}$。\n【步驟二：帶入次數】\n$d = 2$\n$b + c + d = 1 + 2 + 2 = 5$（或由 $N - a = 10 - 5 = 5$ 取得）。\n【步驟三：計算數值】\n$Jaccard = \\frac{2}{5} = 0.40$。\n【步驟四：對比反思】\nSMC 為 0.70，而 Jaccard 為 0.40。正是因為拿掉了 5 個無關的雙 0，真實反映出兩人在感興趣商品的重疊度僅為 40%！",
    cramSummary: {
      conceptName: "Jaccard 指數計算",
      keyTakeaway: "Jaccard = d / (b + c + d) = 2 / (1 + 2 + 2) = 0.40。分母分子都絕對不含 a！"
    }
  },
  {
    id: "q-u2-l3-01",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 3,
    type: "mcq",
    title: "品質檢驗情境下 SMC 反超 Jaccard 之實務辨析",
    questionPrompt: "某晶圓代工廠品管部門對兩批出廠晶圓抽檢 50 項嚴格的物理缺陷特徵（1 表存在缺陷，0 表無缺陷/合格）。檢驗結果顯示：兩批晶圓在 46 項缺陷特徵上皆未檢出（雙 0），在 2 項特徵上皆檢出相同缺陷（雙 1），另有 2 項為單邊檢出。若欲衡量兩批產品在「品質規格一致性」上的契合度，為何此時選用 SMC 比 Jaccard 更具管理合理性？",
    givenData: {
      "雙0無缺陷項目 a": "46",
      "單邊檢出缺陷 b + c": "2",
      "雙1共同缺陷 d": "2",
      "總檢驗項目 N": "50"
    },
    options: [
      {
        key: "A",
        text: "因為 SMC 計算速度較快，品管需要即時反應",
        distractorFeedback: "兩者計算均極為簡便，運算速度不是選用理由。"
      },
      {
        key: "B",
        text: "因為在品管標準中，「兩者皆未出現缺陷（雙 0）」代表共同合規，具備高度管理價值，不應被排除",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "因為 Jaccard 指數在此情境下計算結果會大於 1，違反數學定義",
        distractorFeedback: "Jaccard 算出來是 2/(2+2) = 0.50，不會大於 1。"
      },
      {
        key: "D",
        text: "因為 SMC 能將連續變異數轉為二元屬性",
        distractorFeedback: "SMC 本身不能轉換變數型態。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "SMC = \\frac{46 + 2}{50} = 0.96, \\quad Jaccard = \\frac{2}{2 + 2} = 0.50",
    fullSolution: "【步驟一：深入商業場景】在購物籃分析中，「沒買某物」通常無明確意義；但在此品管情境中，「兩者皆無缺陷（雙 0）」代表兩批晶圓在該規格上『共同達到合規標準』，具備極高實質品質意涵。\n【步驟二：指標對比】若用 Jaccard 排除 46 項合規特徵，相似度會暴跌至 2/(2+2)=0.50（看似一半不合），這嚴重扭曲了事實；而 SMC 為 (46+2)/50 = 0.96 (96%)，忠實反映兩批產品高度一致合格的狀態！\n【步驟三：結論】當雙 0 具備對稱實質意義時，應使用 SMC。",
    cramSummary: {
      conceptName: "SMC 合理應用場景",
      keyTakeaway: "當「雙 0」具備重要管理意涵（如共同合規、共同具備安全性），SMC 才是正確指標！"
    }
  },

  {
    id: "q-u2-l1-02",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 1,
    type: "mcq",
    title: "二元列聯表四格參數意涵與公式分母辨析",
    questionPrompt: "在比對兩位顧客（或兩筆樣本）的 $N$ 個二元屬性時，依課堂板書 IMG_0131 所定義的二元列聯表（$a$ 為雙 0、$b$ 為 A無B有、$c$ 為 A有B無、$d$ 為雙 1），關於 SMC 與 Jaccard 指數的計算結構與分母意涵，下列敘述何者完全正確？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "SMC 與 Jaccard 指數的分母完全相同，皆為總屬性個數 $N = a + b + c + d$",
        distractorFeedback: "觀念混淆！Jaccard 指數排除雙 0 ($a$)，其分母僅為 $b + c + d = N - a$（聯集），只有 SMC 的分母才是總數 $N$。"
      },
      {
        key: "B",
        text: "SMC 分母為全特徵數 $a+b+c+d$，而 Jaccard 分母為聯集數 $b+c+d$（即 $N-a$），分子僅保留共同具備之交集 $d$",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "板書定義中，$a$ 代表雙方皆購買（雙 1），$d$ 代表雙方皆未購買（雙 0）",
        distractorFeedback: "顛倒了！課堂板書 IMG_0131 明確規範：$a$ 是左上角 $(0,0)$ 雙無，$d$ 才是右下角 $(1,1)$ 雙有。"
      },
      {
        key: "D",
        text: "Jaccard 指數的分子包含 $a + d$，因此其計算數值永遠大於或等於 SMC",
        distractorFeedback: "顛倒了！包含 $a + d$ 的是 SMC 分子；Jaccard 分子僅為 $d$。當存在雙 0 ($a > 0$) 時，Jaccard 數值通常小於 SMC。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "SMC = \\frac{a+d}{a+b+c+d}, \\quad Jaccard = \\frac{d}{b+c+d} = \\frac{d}{N-a}",
    fullSolution: "【步驟一：板書列聯表結構】依課堂板書 IMG_0131：\n- $a$：雙方皆為 0（皆無 / 皆未買）\n- $b$：A 為 0、B 為 1（A無 B有）\n- $c$：A 為 1、B 為 0（A有 B無）\n- $d$：雙方皆為 1（皆有 / 皆購買）\n總維度數 $N = a + b + c + d$。\n【步驟二：公式結構對比】\n- SMC（簡單匹配係數）：$\\frac{a+d}{a+b+c+d}$，分母為全部維度 $N$。\n- Jaccard（雅卡爾指數）：$\\frac{d}{b+c+d} = \\frac{d}{N-a}$，分母排除 $a$（僅看至少一方具備的聯集），分子僅留 $d$（雙方皆具備之交集）。\n【步驟三：結論】選項 (B) 精確揭示了兩者分母與分子的本質差異。",
    cramSummary: {
      conceptName: "二元列聯表結構與公式分母",
      keyTakeaway: "SMC 分母看全部 N=a+b+c+d，分子看雙0加雙1 (a+d)；Jaccard 分母排除 a (b+c+d)，分子只看雙1 (d)。"
    }
  },
  {
    id: "q-u2-l1-03",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 1,
    type: "mcq",
    title: "板書「拿掉 a」核心原則之商務應用時機",
    questionPrompt: "課堂板書 IMG_0131 特別註記核心心法：「拿掉 $a$：當 $a$ 這筆資料不重要時，使用雅卡爾指數（Jaccard）！」依照此一出題與實務原則，下列哪一種情境因其屬性具備「高度稀疏性（Sparse）」且「雙 0（兩者皆無）不具實質資訊價值」，因而最必須「拿掉 $a$」採用 Jaccard 指數？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "串流影音平台分析十萬部電影目錄中，兩位訂閱用戶的觀看偏好重疊度",
        distractorFeedback: null
      },
      {
        key: "B",
        text: "人資部門統計全體員工的生理性別（男/女），進行性別比例對稱特徵分析",
        distractorFeedback: "性別屬於對稱屬性（Symmetric Attribute），雙方皆男 (0,0) 與雙方皆女 (1,1) 同等重要，不應排除 $a$。"
      },
      {
        key: "C",
        text: "晶圓半導體廠測試機台針對 100 項嚴苛缺陷代碼之檢測結果（「皆無缺陷」為良率判定的關鍵合格指標）",
        distractorFeedback: "兩台機台同時「皆無缺陷 (0,0)」是判定一致合格的關鍵依據，$a$ 具備核心品管價值，不可拿掉。"
      },
      {
        key: "D",
        text: "評估兩名受測者在擲銅板實驗中「正面 (1)」與「反面 (0)」的結果吻合率",
        distractorFeedback: "擲銅板正反機率各半且對稱，雙反面 (0,0) 與雙正面 (1,1) 權重相同，應採用 SMC 衡量整體符合度。"
      }
    ],
    correctAnswer: "A",
    formulaHint: "Jaccard = \\frac{d}{b+c+d} \\implies \\text{拿掉 } a \\text{（當 } a \\text{ 資料不重要時）}",
    fullSolution: "【步驟一：板書核心精神】板書 IMG_0131 特別強調：「拿掉 a：當 a 這筆資料不重要時，使用雅卡爾指數！」\n【步驟二：稀疏性與假性高相似度】在串流影音或電商推薦中，影片或商品數成千上萬（海量維度），任何兩位用戶共同「未看過/未購買」的項目 $a$ 高達數萬件。若將 $a$ 計入（使用 SMC），所有用戶間的相似度皆會被雙 0 灌水稀釋至 0.99 以上，失去鑑別力！因此必須「拿掉 $a$」，僅聚焦於至少一人看過的聯集中兩人的共同觀看交集（Jaccard）。\n【步驟三：對照對稱屬性】選項 (B)、(C)、(D) 的雙 0 皆具備對稱實質意義（性別、晶圓合格、硬幣反面），不應盲目拿掉 $a$。",
    cramSummary: {
      conceptName: "板書「拿掉 a」使用時機",
      keyTakeaway: "板書鐵律：資料高度稀疏、雙 0 不代表共同偏好（如海量商品、串流片單）時，必拿掉 a 用 Jaccard！"
    }
  },
  {
    id: "q-u2-l2-03",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 2,
    type: "numeric",
    title: "二元特徵向量自主建表與 Jaccard 相似度計算",
    questionPrompt: "某電商平台分析甲、乙兩位顧客在 10 項代表性商品類別中的購買紀錄（1 表有購買，0 表未購買）：\n- 顧客甲：`[1, 1, 1, 1, 1, 0, 0, 0, 0, 0]`\n- 顧客乙：`[1, 1, 1, 0, 0, 1, 0, 0, 0, 0]`\n請根據二元關聯列聯表規則，統計兩人之 $a, b, c, d$ 次數，並計算甲與乙之間的「雅卡爾指數（Jaccard Index）」。（四捨五入至小數點後兩位）",
    givenData: {
      "總商品品項數 N": "10",
      "顧客甲購買向量": "[1, 1, 1, 1, 1, 0, 0, 0, 0, 0]",
      "顧客乙購買向量": "[1, 1, 1, 0, 0, 1, 0, 0, 0, 0]"
    },
    options: null,
    correctAnswer: 0.50,
    unitLabel: "",
    tolerance: 0.02,
    formulaHint: "Jaccard = \\frac{d}{b + c + d} = \\frac{d}{N - a}",
    fullSolution: "【步驟一：逐項比對 10 項商品求列聯表】\n- 商品 1~3：甲=1 且 乙=1 $\\implies$ 雙 1 共同購買 $d = 3$\n- 商品 4~5：甲=1 且 乙=0 $\\implies$ 甲買乙未買 $c = 2$\n- 商品 6：甲=0 且 乙=1 $\\implies$ 乙買甲未買 $b = 1$\n- 商品 7~10：甲=0 且 乙=0 $\\implies$ 雙 0 皆未買 $a = 4$\n總商品數 $N = a + b + c + d = 4 + 1 + 2 + 3 = 10$。\n【步驟二：套用板書 Jaccard 公式】\n$$Jaccard = \\frac{d}{b + c + d} = \\frac{3}{1 + 2 + 3} = \\frac{3}{6} = 0.50$$\n【步驟三：商務意涵】\n依課堂板書 IMG_0131，排除兩者皆未購買之 4 項商品（拿掉 $a=4$），在兩人至少有一方購買之 6 項商品聯集中，有 3 項為共同購買，偏好重疊度為 0.50（50%）。",
    cramSummary: {
      conceptName: "二元向量建表與 Jaccard 計算",
      keyTakeaway: "先數出 d(雙1)、c(甲1乙0)、b(甲0乙1)、a(雙0)。Jaccard = d / (b + c + d)。本題 3 / (1 + 2 + 3) = 0.50。"
    }
  },
  {
    id: "q-u2-l3-02",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 3,
    type: "numeric",
    title: "電商購物籃雙 0 稀釋灌水效應量化計算（SMC 與 Jaccard 差額）",
    questionPrompt: "某生鮮量販店分析兩位會員在 20 項特定檔期商品中的二元購買行為。統計結果顯示：\n- 兩人皆購買之品項數 $d = 3$\n- 甲購買但乙未購買之品項數 $c = 2$\n- 乙購買但甲未購買之品項數 $b = 1$\n- 兩人皆未購買之品項數 $a = 14$\n請分別計算兩位會員的簡單匹配係數（SMC）與雅卡爾指數（Jaccard），並計算**因計入雙 0 負匹配項目導致 SMC 比 Jaccard 虛高膨脹了多少**（即求差額 $SMC - Jaccard$）。（四捨五入至小數點後兩位）",
    givenData: {
      "總商品數 N": "20",
      "雙1共同購買數 d": "3",
      "甲買乙未買數 c": "2",
      "乙買甲未買數 b": "1",
      "雙0皆未買數 a": "14"
    },
    options: null,
    correctAnswer: 0.35,
    unitLabel: "",
    tolerance: 0.02,
    formulaHint: "SMC = \\frac{a + d}{N}, \\quad Jaccard = \\frac{d}{b + c + d}, \\quad \\Delta = SMC - Jaccard",
    fullSolution: "【步驟一：計算簡單匹配係數 SMC（含雙 0）】\n$$SMC = \\frac{a + d}{a + b + c + d} = \\frac{14 + 3}{20} = \\frac{17}{20} = 0.85$$\n【步驟二：計算雅卡爾指數 Jaccard（板書拿掉 a）】\n$$Jaccard = \\frac{d}{b + c + d} = \\frac{3}{1 + 2 + 3} = \\frac{3}{6} = 0.50$$\n【步驟三：量化雙 0 稀釋灌水差距】\n$$\\text{虛高膨脹差額 } \\Delta = SMC - Jaccard = 0.85 - 0.50 = 0.35$$\n【步驟四：商務結論】\n若不依板書規範「拿掉 $a$」，大量未購買的商品（$a=14$）會使相似度從真正的 0.50 被灌水虛增 0.35 至 0.85，嚴重失真！",
    cramSummary: {
      conceptName: "雙 0 灌水差額量化 (SMC - Jaccard)",
      keyTakeaway: "SMC = (a+d)/N = 0.85，Jaccard = d/(b+c+d) = 0.50。虛高灌水差額 = 0.85 - 0.50 = 0.35。"
    }
  },
  {
    id: "q-u2-l4-01",
    unit: "ch02-similarity",
    unitName: "距離與相似度度量",
    level: 4,
    type: "numeric",
    title: "推薦系統雙 0 稀釋效應 (Dilution) 與 SMC 灌水檢驗",
    questionPrompt: "某大型串流影音平台分析兩位深度影迷對片庫的觀看清單。在原先聚焦的 10 部精選電影中：\n兩人共同看過 3 部 ($d = 3$)，甲看過乙未看 2 部 ($c = 2$)，乙看過甲未看 1 部 ($b = 1$)，兩人皆未看 4 部 ($a = 4$)。\n此時平台資料庫擴充導入了 90 部冷門老電影，而兩位影迷對這 90 部老電影皆「完全未觀看」（使得雙 0 項目 $a$ 增加 90，變為 $a' = 94$，總部數 $N' = 100$）。\n請計算資料庫擴充後兩人之「新 SMC 數值」（請輸入四捨五入至小數點後兩位之數值，如 0.97）。",
    givenData: {
      "擴充後雙0次數 a'": "94",
      "甲0乙1次數 b": "1",
      "甲1乙0次數 c": "2",
      "雙1次數 d": "3",
      "擴充後總片數 N'": "100"
    },
    options: null,
    correctAnswer: 0.97,
    unitLabel: "",
    tolerance: 0.01,
    formulaHint: "SMC' = \\frac{a' + d}{N'} = \\frac{94 + 3}{100}, \\quad Jaccard' = \\frac{d}{b + c + d} = \\frac{3}{6}",
    fullSolution: "【步驟一：回顧擴充前的數據】\n- 擴充前總數 $N = 10$。\n- 擴充前 $SMC = (4 + 3) / 10 = 0.70$。\n- 擴充前 $Jaccard = 3 / (1 + 2 + 3) = 3 / 6 = 0.50$。\n\n【步驟二：計算擴充 90 部未看電影後的新指標】\n- 新總數 $N' = 94 + 1 + 2 + 3 = 100$。\n- 新 $SMC' = \\frac{a' + d}{N'} = \\frac{94 + 3}{100} = \\frac{97}{100} = 0.97$。\n- 新 $Jaccard' = \\frac{d}{b + c + d} = \\frac{3}{1 + 2 + 3} = \\frac{3}{6} = 0.50$。\n\n【步驟三：深度商務反思】\n兩位影迷本質上的觀影重疊度根本毫無改變（依然是 3 部共同、3 部差異）。但 SMC 卻因為海量雙 0 老電影的湧入，相似度從 0.70 暴衝灌水至 0.97（97% 一致！），完全喪失了演算法分群的敏感度！而 Jaccard 堅決排除 $a$，依然穩健定格在 0.50。這正是板書強調在稀疏資料中必用 Jaccard 的經典實證！",
    cramSummary: {
      conceptName: "雙 0 稀釋膨脹實證",
      keyTakeaway: "新增 90 筆無關雙 0，SMC 被灌水至 97/100 = 0.97；而 Jaccard 排除 a 依然定格 0.50。"
    }
  },

  // ==========================================
  // 單元三：機率論與貝氏定理 (ch03-probability)
  // ==========================================
  {
    id: "q-u3-l1-01",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 1,
    type: "mcq",
    title: "互斥事件 vs 獨立事件本質辨析",
    questionPrompt: "設樣本空間中有兩事件 $A$ 與 $B$，且其先驗機率皆大於 0（$P(A) > 0, P(B) > 0$）。若已知 $A$ 與 $B$ 為「互斥事件（Mutually Exclusive）」，則下列關於兩事件獨立性（Independence）之敘述何者恆真？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "事件 A 與事件 B 必定也是獨立事件",
        distractorFeedback: "互斥與獨立絕不相容！若 A 發生，B 絕不可能發生，這正是極強的相依性。"
      },
      {
        key: "B",
        text: "事件 A 與事件 B 必定不是獨立事件（必定相依）",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "只有在 P(A) + P(B) = 1 時兩者才可能獨立",
        distractorFeedback: "若互斥且非零，則 P(A∩B)=0，但 P(A)P(B)>0，任何機率值下都不可能相等。"
      },
      {
        key: "D",
        text: "兩事件是否獨立需視樣本空間大小決定",
        distractorFeedback: "數學上已由定義完全鎖定，與樣本空間大小無關。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "\\text{互斥} \\implies P(A \\cap B) = 0; \\quad \\text{獨立} \\iff P(A \\cap B) = P(A)P(B)",
    fullSolution: "【步驟一：互斥定義】兩事件互斥代表不可能同時發生，故交集機率 $P(A \\cap B) = 0$。\n【步驟二：獨立定義】兩事件獨立之充分必要條件為 $P(A \\cap B) = P(A) \\cdot P(B)$。\n【步驟三：聯立檢驗】因為題目給定 $P(A) > 0$ 且 $P(B) > 0$，故兩者乘積 $P(A) \\cdot P(B) > 0$。\n然而 $P(A \\cap B) = 0 \\ne P(A)P(B)$！\n【步驟四：結論】非零機率的互斥事件必定相依，絕不可能是獨立事件。",
    cramSummary: {
      conceptName: "互斥 vs 獨立陷阱",
      keyTakeaway: "互斥非零必相依！P(A∩B)=0 ≠ P(A)P(B)>0。A 發生 B 就死掉，是最極端的相依。"
    }
  },
  {
    id: "q-u3-l1-02",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 1,
    type: "mcq",
    title: "隨機變數分配概論辨析（課文 3.6 輕量核心）",
    questionPrompt: "關於離散型與連續型隨機變數分配特性，下列敘述何者完全正確？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "連續型隨機變數在任一特定單點 c 上的機率 P(X = c) 等於其機率密度 f(c)",
        distractorFeedback: "連續型隨機變數任一單點機率恆為 0！f(c) 是密度值而非機率。"
      },
      {
        key: "B",
        text: "卜瓦松分配 (Poisson Distribution) 的核心特徵為其期望值恰好等於變異數 (E(X) = Var(X) = λ)",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "二項分配 n = 10, p = 0.4 時，其期望值為 6.0、變異數為 2.4",
        distractorFeedback: "二項分配期望值 E = np = 10 * 0.4 = 4.0（非 6.0）。"
      },
      {
        key: "D",
        text: "常態分配鐘形曲線的胖瘦程度取決於平均數 μ，中心位置取決於標準差 σ",
        distractorFeedback: "顛倒了！平均數 μ 決定中心位置，標準差 σ 決定胖瘦程度。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "E(X)_{Poisson} = Var(X)_{Poisson} = \\lambda",
    fullSolution: "【步驟一：各選項檢核】\n- (A) 錯誤：連續型變數單點機率恆為 0 ($P(X=c)=0$)，機率為曲線下的面積積分。\n- (B) 正確：卜瓦松分配描述單位時間內稀有事件發生數，其數學母數 $\\lambda$ 同時為期望值與變異數。\n- (C) 錯誤：期望值 $E(X) = np = 10 \\times 0.4 = 4.0$；變異數 $Var(X) = 10 \\times 0.4 \\times 0.6 = 2.4$。\n- (D) 錯誤：$\\mu$ 決定中心位置，$\\sigma$ 決定分散胖瘦。",
    cramSummary: {
      conceptName: "隨機變數分配特徵",
      keyTakeaway: "連續型單點機率恆為 0；卜瓦松 E(X) = Var(X) = λ；二項 E = np, Var = np(1-p)。"
    }
  },
  {
    id: "q-u3-l2-01",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 2,
    type: "numeric",
    title: "晶圓瑕疵檢測後驗機率（貝氏更新）",
    questionPrompt: "某精密晶圓廠良品率為 $P(G) = 0.80$，不良品率為 $P(D) = 0.20$。自動光學檢測機 (AOI) 的檢測特性為：\n- 當晶片為不良品時，發出警報（Positive, $T^+$）的機率為 $90\\%$。\n- 當晶片為良品時，誤報警報（偽陽性 False Positive）的機率為 $5\\%$。\n若某顆晶片檢測時觸發了警報（$T^+$），請問該晶片「實際上確實為不良品」的後驗機率 $P(D|T^+)$ 為何（%）？（四捨五入至小數點後兩位）",
    givenData: {
      "先驗不良品率 P(D)": "0.20",
      "先驗良品率 P(G)": "0.80",
      "不良品發出警報 P(T+|D)": "0.90",
      "良品誤報警報 P(T+|G)": "0.05"
    },
    options: null,
    correctAnswer: 81.82,
    unitLabel: "%",
    tolerance: 0.1,
    formulaHint: "P(D|T^+) = \\frac{P(T^+|D)P(D)}{P(T^+|D)P(D) + P(T^+|G)P(G)}",
    fullSolution: "【步驟一：全機率計算警報總機率 P(T+)】\n$P(T^+) = P(T^+ \\cap D) + P(T^+ \\cap G)$\n$P(T^+) = (0.90 \\times 0.20) + (0.05 \\times 0.80) = 0.180 + 0.040 = 0.220$。\n【步驟二：貝氏定理倒推後驗機率】\n$P(D|T^+) = \\frac{P(T^+|D)P(D)}{P(T^+)} = \\frac{0.180}{0.220} = \\frac{18}{22} = \\frac{9}{11} \\approx 0.81818...$\n【步驟三：轉換為百分比】\n$81.82\\%$。\n【步驟四：管理結論】晶片觸發警報後，不良品機率由原本的先驗 20% 大幅修正提升至 81.82%。",
    cramSummary: {
      conceptName: "貝氏定理後驗更新",
      keyTakeaway: "分母算全機率：0.9*0.2 + 0.05*0.8 = 0.22。分子不良且警報：0.18。0.18/0.22 = 81.82%。"
    },
    hasDynamicGenerator: true,
    dynamicType: "bayes"
  },
  {
    id: "q-u3-l3-01",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 3,
    type: "numeric",
    title: "雙產線瑕疵品歸因貝氏更新",
    questionPrompt: "某科技公司由產線 A 與產線 B 生產同一款電源供應器。產線 A 佔全廠產量 $60\\%$，不良品率為 $2\\%$；產線 B 佔全廠產量 $40\\%$，不良品率為 $5\\%$。\n品管員在成品倉庫隨機抽出一件產品，經測試確認為「不良品（Defective, D）」。請問該不良品是由產線 B 所生產的後驗機率 $P(B|D)$ 為何（%）？（四捨五入至小數點後兩位）",
    givenData: {
      "產線 A 產能比例 P(A)": "0.60, 不良率 P(D|A) = 0.02",
      "產線 B 產能比例 P(B)": "0.40, 不良率 P(D|B) = 0.05"
    },
    options: null,
    correctAnswer: 62.5,
    unitLabel: "%",
    tolerance: 0.1,
    formulaHint: "P(B|D) = \\frac{P(D|B)P(B)}{P(D|A)P(A) + P(D|B)P(B)}",
    fullSolution: "【步驟一：全機率計算抽到不良品的總機率 P(D)】\n- 來自產線 A 的不良品：$P(A \\cap D) = 0.60 \\times 0.02 = 0.012$\n- 來自產線 B 的不良品：$P(B \\cap D) = 0.40 \\times 0.05 = 0.020$\n- 倉庫抽檢出不良品的總機率：$P(D) = 0.012 + 0.020 = 0.032$\n【步驟二：貝氏定理更新產線 B 後驗機率】\n$P(B|D) = \\frac{P(D|B)P(B)}{P(D)} = \\frac{0.020}{0.032} = \\frac{20}{32} = \\frac{5}{8} = 0.625 = 62.5\\%$。\n【步驟三：商務結論】儘管產線 B 只佔總產量的 40%，但一旦發現不良品，有超過 62.5% 的機率是產線 B 惹的禍！",
    cramSummary: {
      conceptName: "雙產線貝氏歸因",
      keyTakeaway: "產線 A 不良貢獻 0.012，產線 B 貢獻 0.020，總不良 0.032。B 歸因率 0.020/0.032 = 62.5%。"
    }
  },

  {
    id: "q-u3-l1-03",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 1,
    type: "mcq",
    title: "機率加法法則與互斥獨立真理",
    questionPrompt: "某連鎖量販店統計顧客購買行為，已知顧客購買牛奶的機率為 $P(M) = 0.60$，購買麵包的機率為 $P(B) = 0.50$，同時購買牛奶與麵包的機率為 $P(M \\cap B) = 0.30$。下列敘述何者完全正確？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "顧客至少購買牛奶或麵包其中一種的機率為 $P(M \\cup B) = 0.80$",
        distractorFeedback: null
      },
      {
        key: "B",
        text: "因為 $P(M \\cap B) > 0$，代表購買牛奶與購買麵包彼此互斥",
        distractorFeedback: "互斥是指交集機率為 0！交集大於 0 表示非互斥。"
      },
      {
        key: "C",
        text: "顧客在已購買麵包的條件下購買牛奶的機率為 0.50",
        distractorFeedback: "條件機率 P(M|B) = P(M ∩ B) / P(B) = 0.30 / 0.50 = 0.60。"
      },
      {
        key: "D",
        text: "顧客既不買牛奶也不買麵包的機率為 0.30",
        distractorFeedback: "兩者皆未購買之機率為 1 - P(M ∪ B) = 1 - 0.80 = 0.20。"
      }
    ],
    correctAnswer: "A",
    formulaHint: "P(M \\cup B) = P(M) + P(B) - P(M \\cap B)",
    fullSolution: "【步驟一：加法法則求聯集】\n$P(M \\cup B) = P(M) + P(B) - P(M \\cap B) = 0.60 + 0.50 - 0.30 = 0.80$。故 (A) 正確！\n【步驟二：互斥檢定】\n因為 $P(M \\cap B) = 0.30 \ne 0$，兩事件非互斥。故 (B) 錯。\n【步驟三：條件機率檢定】\n$P(M|B) = \\frac{P(M \\cap B)}{P(B)} = \\frac{0.30}{0.50} = 0.60$。故 (C) 錯。\n【步驟四：狄摩根餘事檢定】\n$P(M^c \\cap B^c) = 1 - P(M \\cup B) = 1 - 0.80 = 0.20$。故 (D) 錯。",
    cramSummary: {
      conceptName: "機率加法定理",
      keyTakeaway: "P(A ∪ B) = P(A) + P(B) - P(A ∩ B)！本題 0.60 + 0.50 - 0.30 = 0.80。"
    }
  },
  {
    id: "q-u3-l2-02",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 2,
    type: "numeric",
    title: "聯集機率與餘事機率手算",
    questionPrompt: "某軟體公司統計內部伺服器運行日誌，發現某日網路連線異常的機率為 $P(A) = 0.35$，資料庫讀寫逾時的機率為 $P(B) = 0.25$。兩者同時發生的機率為 $P(A \\cap B) = 0.10$。請計算該日「系統完全正常（即網路與資料庫皆未發生異常）」的機率 $P(A^c \\cap B^c)$（以小數表示，如 0.50）。",
    givenData: {
      "網路異常機率 P(A)": "0.35",
      "資料庫逾時機率 P(B)": "0.25",
      "同時異常機率 P(A ∩ B)": "0.10"
    },
    options: null,
    correctAnswer: 0.50,
    unitLabel: "",
    tolerance: 0.02,
    formulaHint: "P(A^c \\cap B^c) = 1 - P(A \\cup B) = 1 - [P(A) + P(B) - P(A \\cap B)]",
    fullSolution: "【步驟一：求至少有一項異常之聯集機率】\n$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = 0.35 + 0.25 - 0.10 = 0.50$。\n【步驟二：求完全正常（餘事）之機率】\n根據狄摩根定律：$P(A^c \\cap B^c) = P((A \\cup B)^c) = 1 - P(A \\cup B) = 1 - 0.50 = 0.50$。\n【步驟三：結論】該日系統完全正常之機率恰好為 0.50 (50%)。",
    cramSummary: {
      conceptName: "餘事機率與聯集",
      keyTakeaway: "完全正常 = 1 - 至少一項異常 = 1 - (0.35 + 0.25 - 0.10) = 0.50。"
    }
  },
  {
    id: "q-u3-l2-03",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 2,
    type: "numeric",
    title: "二項分配期望值與標準差",
    questionPrompt: "某網路電商的行銷廣告點擊轉換率為 $p = 0.20$。今業務部門隨機抽取 $n = 100$ 名點擊廣告的訪客，令隨機變數 $X$ 代表最終下單購買的人數。請計算該隨機變數 $X$ 的「標準差 $\\sigma$」。",
    givenData: {
      "試驗次數 n": "100",
      "成功下單機率 p": "0.20"
    },
    options: null,
    correctAnswer: 4.0,
    unitLabel: "人",
    tolerance: 0.05,
    formulaHint: "\\sigma = \\sqrt{Var(X)} = \\sqrt{n p (1 - p)}",
    fullSolution: "【步驟一：二項分配公式】\n隨機變數 $X \\sim Binomial(n = 100, p = 0.20)$。\n- 期望值：$E(X) = n p = 100 \\times 0.20 = 20$ 人。\n- 變異數：$Var(X) = n p (1 - p) = 100 \\times 0.20 \\times (1 - 0.20) = 20 \\times 0.80 = 16.0$。\n【步驟二：求標準差】\n標準差 $\\sigma = \\sqrt{Var(X)} = \\sqrt{16} = 4.0$ 人。\n【步驟三：結論】下單人數的標準差為 4.0 人。",
    cramSummary: {
      conceptName: "二項分配標準差",
      keyTakeaway: "Var(X) = np(1-p) = 100*0.2*0.8 = 16。標準差開根號 sqrt(16) = 4.0。"
    }
  },
  {
    id: "q-u3-l3-02",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 3,
    type: "numeric",
    title: "三產線品質良率貝氏機率逆向更新",
    questionPrompt: "某筆記型電腦工廠擁有 A、B、C 三條生產線，產能分別佔全廠產量的 $50\\%$、$30\\%$、$20\\%$。已知三條產線的不良品率分別為：A 產線 $2\\%$、B 產線 $3\\%$、C 產線 $5\\%$。品管人員在成品倉庫隨機抽驗一台筆電發現為「不良品（Defect）」，請依貝氏定理求該不良品是由「C 產線」所生產的後驗機率 $P(C|Defect)$（以百分比 % 表示，四捨五入至小數點後兩位）。",
    givenData: {
      "A產線市佔與不良率": "P(A)=0.50, P(D|A)=0.02",
      "B產線市佔與不良率": "P(B)=0.30, P(D|B)=0.03",
      "C產線市佔與不良率": "P(C)=0.20, P(D|C)=0.05"
    },
    options: null,
    correctAnswer: 34.48,
    unitLabel: "%",
    tolerance: 0.1,
    formulaHint: "P(C|D) = \\frac{P(D|C)P(C)}{P(D|A)P(A) + P(D|B)P(B) + P(D|C)P(C)}",
    fullSolution: "【步驟一：全機率分解各產線之不良品貢獻度】\n- 產線 A 聯合機率：$P(D \\cap A) = P(D|A)P(A) = 0.02 \\times 0.50 = 0.010$\n- 產線 B 聯合機率：$P(D \\cap B) = P(D|B)P(B) = 0.03 \\times 0.30 = 0.009$\n- 產線 C 聯合機率：$P(D \\cap C) = P(D|C)P(C) = 0.05 \\times 0.20 = 0.010$\n【步驟二：求全廠總不良品機率 (分母)】\n$P(D) = 0.010 + 0.009 + 0.010 = 0.029$ (2.9%)。\n【步驟三：貝氏定理求 C 產線後驗機率】\n$P(C|D) = \\frac{P(D \\cap C)}{P(D)} = \\frac{0.010}{0.029} = \\frac{10}{29} \\approx 0.344827 = 34.48\\%$。\n【步驟四：商務結論】C 產線雖然產能僅佔 20%，但因不良率高達 5%，一旦抽驗出瑕疵，有 34.48% 的後驗機率歸咎於 C 產線！",
    cramSummary: {
      conceptName: "三分割貝氏更新",
      keyTakeaway: "分母 P(D) = 0.010 + 0.009 + 0.010 = 0.029。C 後驗機率 0.010/0.029 = 34.48%。"
    }
  },
  {
    id: "q-u3-l4-01",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 4,
    type: "numeric",
    title: "罕見詐欺交易偽陽性悖論 (Rare Event False Positive Paradox)",
    questionPrompt: "某數位銀行建立 AI 信用卡反洗錢監測模型。全行交易中僅有 $0.1\\%$ 為「真實洗錢交易」（即先驗機率 $P(Fraud) = 0.001$，正常交易 $P(Legit) = 0.999$）。AI 模型具備高達 $95\\%$ 的命中率（即 $P(Alert|Fraud) = 0.95$），但對正常交易亦有 $1\\%$ 的誤報率（即 $P(Alert|Legit) = 0.01$）。若系統今日對某筆交易發出「洗錢警報 (Alert)」，請計算該筆交易「確實為洗錢」的真實後驗機率 $P(Fraud|Alert)$（%）。（四捨五入至小數點後兩位）",
    givenData: {
      "洗錢先驗 P(Fraud)": "0.001",
      "正常先驗 P(Legit)": "0.999",
      "警報命中率 P(Alert|Fraud)": "0.95",
      "正常誤報率 P(Alert|Legit)": "0.01"
    },
    options: null,
    correctAnswer: 8.68,
    unitLabel: "%",
    tolerance: 0.1,
    formulaHint: "P(Fraud|Alert) = \\frac{P(Alert|Fraud)P(Fraud)}{P(Alert|Fraud)P(Fraud) + P(Alert|Legit)P(Legit)}",
    fullSolution: "【步驟一：計算真警報與假警報聯合機率】\n- 真警報聯合機率：$P(Alert \\cap Fraud) = 0.95 \\times 0.001 = 0.00095$\n- 假警報（正常被誤判）聯合機率：$P(Alert \\cap Legit) = 0.01 \\times 0.999 = 0.00999$\n【步驟二：全機率求總警報率 (分母)】\n$P(Alert) = 0.00095 + 0.00999 = 0.01094$。\n【步驟三：貝氏定理求真實洗錢機率】\n$P(Fraud|Alert) = \\frac{0.00095}{0.01094} \\approx 0.086837 = 8.68\\%$。\n【步驟四：管理反思（偽陽性悖論）】\n即便 AI 辨識準確率高達 95%、誤報率僅 1%，但因為罕見事件的母體基底太小（0.1%），絕大多數的警報其實都是正常交易誤報！收到警報後真實為洗錢的機率不到 9%！這就是風控領域知名的「偽陽性悖論」。",
    cramSummary: {
      conceptName: "偽陽性悖論貝氏計算",
      keyTakeaway: "分子真洗錢 0.00095，分母總警報 0.01094。後驗機率僅 8.68%！不可迷信高準確率。"
    }
  },
  {
    id: "q-u3-l4-02",
    unit: "ch03-probability",
    unitName: "機率論與貝氏定理",
    level: 4,
    type: "self-check",
    title: "作業必出魔王題：兩階段分店試驗與貝氏定理全機率逆向更新（企3B 作業 EX1 & EX2）",
    questionPrompt: "【情境描述】某國際知名連鎖品牌評估進入台灣市場，規劃以下策略：\n- 若直接全面開設分店，預估市場全面成功先驗機率為 $P(AS) = 0.70$，全面失敗先驗機率為 $P(AF) = 0.30$。\n- 公司考慮先成立一家分店進行局部市場試驗。根據海外歷史經驗之檢測可靠度（條件機率）：\n  * 若全面開店會成功，則分店試驗成功的條件機率為 $P(BS|AS) = 0.90 \\implies P(BF|AS) = 0.10$。\n  * 若全面開店會失敗，則分店試驗失敗的條件機率為 $P(BF|AF) = 0.85 \\implies P(BS|AF) = 0.15$。\n【請推導回答】（依作業 EX2 要求，純粹貝氏定理機率推導，不涉及決策樹折現與 EVSI）：\n(1) 利用全機率定理（Law of Total Probability），計算分店試驗成功 $P(BS)$ 與分店試驗失敗 $P(BF)$ 的邊界機率。\n(2) 利用貝氏定理（Bayes' Theorem），計算在觀察到分店試驗結果後的四大後驗機率：$P(AS|BS)$、$P(AF|BS)$、$P(AS|BF)$、$P(AF|BF)$。",
    givenData: {
      "全面開店先驗機率": "P(AS) = 0.70, P(AF) = 0.30",
      "分店試驗條件精度": "P(BS|AS) = 0.90, P(BF|AF) = 0.85"
    },
    formulaHint: "P(BS) = P(BS|AS)P(AS) + P(BS|AF)P(AF), \\quad P(AS|BS) = \\frac{P(BS|AS)P(AS)}{P(BS)}",
    fullSolution: "【Step 1：全機率定理計算邊界機率】\n- 分店試驗成功機率：\n  $$P(BS) = P(BS|AS)P(AS) + P(BS|AF)P(AF) = (0.90 \\times 0.70) + (0.15 \\times 0.30) = 0.630 + 0.045 = 0.675 \\quad (67.5\\%)$$ \n- 分店試驗失敗機率：\n  $$P(BF) = P(BF|AS)P(AS) + P(BF|AF)P(AF) = (0.10 \\times 0.70) + (0.85 \\times 0.30) = 0.070 + 0.255 = 0.325 \\quad (32.5\\%)$$ \n*(驗算完備性：$P(BS) + P(BF) = 0.675 + 0.325 = 1.000$ 正確)*\n\n【Step 2：貝氏定理更新四大後驗機率】\n- 情況一：若分店試驗傳來「成功」訊息 (BS)：\n  1. 全面開店成功後驗機率：\n     $$P(AS|BS) = \\frac{P(BS \\cap AS)}{P(BS)} = \\frac{P(BS|AS)P(AS)}{P(BS)} = \\frac{0.630}{0.675} = \\frac{14}{15} \\approx 0.9333 \\quad (93.33\\%)$$ \n  2. 全面開店失敗後驗機率：\n     $$P(AF|BS) = 1 - P(AS|BS) = \\frac{1}{15} \\approx 0.0667 \\quad (6.67\\%)$$ \n- 情況二：若分店試驗傳來「失敗」訊息 (BF)：\n  3. 全面開店成功後驗機率：\n     $$P(AS|BF) = \\frac{P(BF \\cap AS)}{P(BF)} = \\frac{P(BF|AS)P(AS)}{P(BF)} = \\frac{0.070}{0.325} = \\frac{14}{65} \\approx 0.2154 \\quad (21.54\\%)$$ \n  4. 全面開店失敗後驗機率：\n     $$P(AF|BF) = 1 - P(AS|BF) = \\frac{51}{65} \\approx 0.7846 \\quad (78.46\\%)$$ \n\n【Step 3：管理決策洞察與範圍界定】\n- 透過開設一家分店的小額試驗，能大幅降低展店風險：試驗成功將使展店成功機率由先驗的 70% 躍升至 93.33%；試驗失敗則使成功機率遽降至 21.54%（失敗風險高達 78.46%）。\n- **嚴格範圍界定**：本題出自企3B 楊亞恩作業 EX1 & EX2，老師作業僅要求推導邊界機率與四個後驗機率。決策樹逆向折現 (Backward Induction)、分支修剪 (Pruning) 與樣本情報價值 (EVSI) 屬於 Ch 13.4 完全超綱，期末考絕不出題！",
    cramSummary: {
      conceptName: "貝氏定理與全機率逆向更新 (企3B作業)",
      keyTakeaway: "P(BS)=0.675, P(BF)=0.325。後驗機率 P(AS|BS)=14/15 (93.33%), P(AS|BF)=14/65 (21.54%)！切勿擴展決策樹或 EVSI（超綱）。"
    }
  },

  // ==========================================
  // 單元四：迴歸分析與交互作用 (ch06-regression)
  // (注意：6.3 羅吉斯迴歸 100% 排除！)
  // ==========================================
  {
    id: "q-u4-l1-01",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 1,
    type: "mcq",
    title: "判定係數 R² 盲目加變數虛胖陷阱（板書核心）",
    questionPrompt: "在多元線性迴歸模型中，若研究者盲目加入 10 個與依變數毫無實質因果關係的自變數，下列指標的變化情形何者最符合統計學理？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "判定係數 R² 必定大幅下降，調整後判定係數 R²_adj 必定上升",
        distractorFeedback: "兩者變動方向完全反了！"
      },
      {
        key: "B",
        text: "判定係數 R² 單調不減（微升或持平），但調整後判定係數 R²_adj 往往會下降",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "總變異量 SST 隨之大幅增加，導致殘差平方和 SSE 縮小",
        distractorFeedback: "依變數 Y 的總變異 SST = Σ(y - ȳ)² 僅取決於 Y 自身數據，與加入多少自變數毫無關係。"
      },
      {
        key: "D",
        text: "所有新增無關變數之係數 t 檢定 p-value 必定小於 0.05",
        distractorFeedback: "無關變數的 p-value 通常遠大於 0.05，無法通過顯著性檢定。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "R_{adj}^2 = 1 - \\left[ \\frac{SSE / (n - k - 1)}{SST / (n - 1)} \\right]",
    fullSolution: "【步驟一：板書核心】板書 IMG_0131 特別強調：「R² 代表模型的解釋能力；資料多，解釋能力不一定上升！」\n【步驟二：數學特性】每增加一個自變數，OLS 的最小化機制保證 SSE 單調不增，因此原始 $R^2 = 1 - SSE/SST$ 永遠單調不減（容易產生虛假滿意感）。\n【步驟三：自由度懲罰】調整後判定係數 $R_{adj}^2$ 對自由度消耗施加懲罰。若新增變數解釋力的微小增幅不足以彌補自由度消耗，$R_{adj}^2$ 會果斷下跌！",
    cramSummary: {
      conceptName: "R² 虛胖陷阱",
      keyTakeaway: "多塞變數 R² 絕不減（單調不降），只有 R²_adj 才會懲罰自由度並下跌！SST 與自變數無關。"
    }
  },
  {
    id: "q-u4-l1-02",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 1,
    type: "mcq",
    title: "交互作用項與迴歸斜率幾何意涵（板書核心）",
    questionPrompt: "研究團隊建立行銷銷售預測模型：$\\hat{Y} = b_0 + b_1 X_1 + b_2 X_2 + b_3 (X_1 \\cdot X_2)$，其中 $X_1$ 為線上廣告預算，$X_2$ 為促銷折價券發放量，並納入交互作用項 $(X_1 \\cdot X_2)$。\n模型統計報表顯示 $b_3$ 之 $p$-值為 $0.03$。根據課堂板書與統計學理論，下列哪一項解讀最正確？",
    givenData: {
      "迴歸方程式": "Y = b0 + b1*X1 + b2*X2 + b3*(X1*X2)",
      "交互作用係數 p-value": "0.03"
    },
    options: [
      {
        key: "A",
        text: "因為 p = 0.03 < 0.05，在 95% 信心水準下，廣告預算對營收的邊際效益會隨著折價券多寡而改變（斜率非平行）",
        distractorFeedback: null
      },
      {
        key: "B",
        text: "交互作用項顯著代表廣告預算 X1 對銷售額的影響與折價券 X2 的多寡完全獨立平行",
        distractorFeedback: "若獨立平行，則代表交互作用項不顯著 (b3 = 0)。"
      },
      {
        key: "C",
        text: "因為 p = 0.03 > 0.01，所以在商務統計上該項不具備任何統計顯著性，應直接剔除",
        distractorFeedback: "板書明確指出 0.05 對應 95% 信心水準，是商務分析標準的判斷門檻。"
      },
      {
        key: "D",
        text: "加入該交互作用項後，模型的判定係數 R² 必定會比未加入前更小",
        distractorFeedback: "加入變數只會讓 R² 增加或持平，絕不可能變小。"
      }
    ],
    correctAnswer: "A",
    formulaHint: "\\frac{\\partial \\hat{Y}}{\\partial X_1} = b_1 + b_3 X_2, \\quad p < 0.05 \\iff 95\\% \\text{ 信心水準顯著}",
    fullSolution: "【步驟一：板書 p-value 對照】板書 IMG_0131 明確註記：\n- P-值 0.05 -> 95% 信心水準（最常用標準）\n- P-值 0.01 -> 99% 信心水準\n因 $0.03 < 0.05$，已達 95% 信心水準之顯著性！\n【步驟二：交互作用意涵】對 $X_1$ 求偏微商得邊際效益為 $b_1 + b_3 X_2$。這代表廣告每多投 1 萬元的邊際回報，會隨折價券發放量 $X_2$ 的多寡而放大或縮小（兩變數不是獨立疊加，迴歸線呈現非平行交錯）。",
    cramSummary: {
      conceptName: "交互作用項與 p-value",
      keyTakeaway: "p < 0.05 代表 95% 顯著！交互作用顯著意味著：X1 的邊際斜率取決於 X2 的大小（非平行線）。"
    }
  },
  {
    id: "q-u4-l2-01",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 2,
    type: "numeric",
    title: "變異量拆解與判定係數 R² 計算",
    questionPrompt: "某零售店分析客流量與銷售額的單變數線性迴歸。統計計算得出依變數總變異量 $SST = 1,000$ 萬元，迴歸模型可解釋的變異量 $SSR = 820$ 萬元。請計算該迴歸模型的判定係數 $R^2$（以小數表示，如 0.82）。",
    givenData: {
      "總變異量 SST": "1,000",
      "迴歸平方和 SSR": "820"
    },
    options: null,
    correctAnswer: 0.82,
    unitLabel: "",
    tolerance: 0.01,
    formulaHint: "R^2 = \\frac{SSR}{SST} = 1 - \\frac{SSE}{SST}",
    fullSolution: "【步驟一：變異量等式】$SST = SSR + SSE$。\n【步驟二：判定係數定義】\n$R^2 = \\frac{SSR}{SST} = \\frac{820}{1000} = 0.82$。\n【步驟三：商務解釋】該模型中，客流量能夠解釋總銷售額 $82\\%$ 的變異程度，具有極佳的擬合配適度。",
    cramSummary: {
      conceptName: "判定係數 R² 公式",
      keyTakeaway: "R² = SSR / SST = 可解釋變異 / 總變異。本題 820 / 1000 = 0.82。"
    }
  },

  {
    id: "q-u4-l1-03",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 1,
    type: "mcq",
    title: "迴歸殘差假定 (LINE) 與漏斗形殘差圖判讀",
    questionPrompt: "在普通最小平方法 (OLS) 線性迴歸模型中，若繪製殘差對預測值之散佈圖（Residual Plot），發現殘差點呈現由左向右逐漸散開的「漏斗形狀（橫向擴大）」，這表示模型嚴重違反了下列哪一項統計基本假定？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "違反同質變異性假定（Equal Variance / Homoscedasticity），存在異質變異",
        distractorFeedback: null
      },
      {
        key: "B",
        text: "違反自變數常態性假定",
        distractorFeedback: "OLS 假定的是『殘差項』常態分配，而非自變數常態分配。"
      },
      {
        key: "C",
        text: "違反模型可逆性假定",
        distractorFeedback: "迴歸無此基本假定名稱。"
      },
      {
        key: "D",
        text: "證明判定係數 $R^2$ 必定大於 0.99",
        distractorFeedback: "漏斗形殘差圖代表模型變異不穩定，與 R² 數值大小無必然關係。"
      }
    ],
    correctAnswer: "A",
    formulaHint: "Var(e_i) = \\sigma^2 \\quad (\\text{Homoscedasticity})",
    fullSolution: "【步驟一：LINE 四大假定】\nOLS 迴歸殘差必須滿足：\n1. Linearity（線性關係）\n2. Independence（獨立性，無自我相關）\n3. Normality（常態分配）\n4. Equal Variance（同分散性 / 同值變異，即誤差項變異數固定為常數 $\\sigma^2$）。\n【步驟二：圖形判讀】\n當殘差散佈圖呈現漏斗形（隨預測值增大而上下發散），表示誤差變異數隨尺度改變，此現象稱為「異質變異（Heteroscedasticity）」，會使係數標準誤失真，導致 t 檢定與 p-value 不可信！",
    cramSummary: {
      conceptName: "LINE 假定與異質變異",
      keyTakeaway: "殘差漏斗形 = 違反同值變異（異質變異）！理想殘差應均勻隨機散佈於 0 軸兩側。"
    }
  },
  {
    id: "q-u4-l2-02",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 2,
    type: "numeric",
    title: "簡單線性迴歸斜率與截距手算",
    questionPrompt: "某連鎖超商分析廣告支出 $X$（萬元）對門市營收 $Y$（萬元）之影響，收集 10 家門市數據計算得：\n$\\bar{X} = 10, \\quad \\bar{Y} = 50, \\quad SS_{xx} = \\sum (X_i - \\bar{X})^2 = 40, \\quad SS_{xy} = \\sum (X_i - \\bar{X})(Y_i - \\bar{Y}) = 120$。\n請依最小平方法公式計算迴歸方程式的「截距項 $b_0$」。",
    givenData: {
      "X平均數 X̄": "10",
      "Y平均數 Ȳ": "50",
      "離均差平方和 SSxx": "40",
      "離均差乘積和 SSxy": "120"
    },
    options: null,
    correctAnswer: 20.0,
    unitLabel: "萬元",
    tolerance: 0.05,
    formulaHint: "b_1 = \\frac{SS_{xy}}{SS_{xx}}, \\quad b_0 = \\bar{Y} - b_1 \\bar{X}",
    fullSolution: "【步驟一：計算斜率 b1】\n$b_1 = \\frac{SS_{xy}}{SS_{xx}} = \\frac{120}{40} = 3.0$。\n（經濟意涵：廣告支出每增加 1 萬元，預期營收平均增加 3.0 萬元）。\n【步驟二：計算截距 b0（利用迴歸線必過重心 (X̄, Ȳ)】\n$b_0 = \\bar{Y} - b_1 \\bar{X} = 50 - 3.0 \\times 10 = 50 - 30 = 20.0$ 萬元。\n【步驟三：完整模型方程式】\n$\\hat{Y} = 20.0 + 3.0 X$。截距項為 20.0 萬元。",
    cramSummary: {
      conceptName: "OLS 斜率與截距公式",
      keyTakeaway: "b1 = SSxy / SSxx = 120/40 = 3.0。b0 = Ȳ - b1*X̄ = 50 - 3*10 = 20.0。"
    }
  },
  {
    id: "q-u4-l2-03",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 2,
    type: "numeric",
    title: "變異分解 (ANOVA) 與判定係數 R² 計算",
    questionPrompt: "某計量模型評估產品研發預算對專利產出的解釋力，總樣本數 $n = 25$。計算結果顯示依變數的總變異平方和為 $SST = 500$，而未被模型解釋的殘差平方和為 $SSE = 125$。請計算該模型之「判定係數 $R^2$」（四捨五入至小數點後兩位）。",
    givenData: {
      "總平方和 SST": "500",
      "殘差平方和 SSE": "125",
      "樣本數 n": "25"
    },
    options: null,
    correctAnswer: 0.75,
    unitLabel: "",
    tolerance: 0.02,
    formulaHint: "R^2 = 1 - \\frac{SSE}{SST} = \\frac{SSR}{SST}",
    fullSolution: "【步驟一：變異量分解恆等式】\n$SST = SSR + SSE \implies SSR = SST - SSE = 500 - 125 = 375$。\n【步驟二：計算判定係數 R²】\n$R^2 = \\frac{SSR}{SST} = \\frac{375}{500} = 0.75$（或直接以 $1 - \\frac{SSE}{SST} = 1 - \\frac{125}{500} = 1 - 0.25 = 0.75$）。\n【步驟三：商務結論】\n該迴歸模型成功解釋了專利產出 $75\\%$ 的總變異，擬合度優良。",
    cramSummary: {
      conceptName: "R² 變異分解計算法",
      keyTakeaway: "R² = 1 - SSE/SST = 1 - 125/500 = 0.75。SSR = 500 - 125 = 375。"
    }
  },
  {
    id: "q-u4-l3-01",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 3,
    type: "numeric",
    title: "交互作用項調節邊際斜率計算",
    questionPrompt: "某電子商務平台建立營收預測模型：\n$$\\hat{Y} = 10 + 4 X_1 + 6 X_2 + 1.5 (X_1 \\cdot X_2)$$\n其中 $X_1$ 為行銷折價券面額（百元），$X_2$ 為會員等級（1 到 5 級）。\n若某目標客群的會員等級為 $X_2 = 4$，請問此時行銷折價券 $X_1$ 每增加 1 單位，對營收 $\\hat{Y}$ 的邊際增加效果（即邊際斜率 $\\frac{\\Delta \\hat{Y}}{\\Delta X_1}$）為何？",
    givenData: {
      "迴歸方程式": "Ŷ = 10 + 4*X1 + 6*X2 + 1.5*(X1*X2)",
      "指定會員等級 X2": "4"
    },
    options: null,
    correctAnswer: 10.0,
    unitLabel: "萬元",
    tolerance: 0.05,
    formulaHint: "\\frac{\\partial \\hat{Y}}{\\partial X_1} = b_1 + b_3 X_2",
    fullSolution: "【步驟一：求 X1 對 Y 的邊際效應導數】\n$\\frac{\\partial \\hat{Y}}{\\partial X_1} = b_1 + b_3 X_2 = 4 + 1.5 X_2$。\n【步驟二：代入會員等級 X2 = 4】\n邊際斜率 $= 4 + 1.5 \\times 4 = 4 + 6.0 = 10.0$。\n【步驟三：統計與商務意涵】\n交互作用項係數 $1.5 > 0$ 代表正向加乘效應。當會員等級越高時，折價券激勵買氣的邊際效益越大！在等級 4 的高階會員身上，每發 1 單位折價券能創造 10.0 單位的營收增幅。",
    cramSummary: {
      conceptName: "交互作用邊際斜率求導",
      keyTakeaway: "邊際效應 = b1 + b3*X2。本題 4 + 1.5*4 = 10.0。斜率隨調節變數改變！"
    }
  },
  {
    id: "q-u4-l3-02",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 3,
    type: "mcq",
    title: "調整後判定係數 (R²_adj) 自由度懲罰機制",
    questionPrompt: "某計量分析師在原有包含 2 個有效自變數（$R^2 = 0.65$）的模型中，硬是額外加入 3 個與依變數毫無關聯的雜訊變數。下列有關自由度、殘差平方和與 $R^2_{adj}$ 的統計變化，何者完全符合學理？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "殘差自由度 $n - k - 1$ 減少，且新增變數未顯著降低 $SSE$，使得懲罰項增大，導致 $R^2_{adj}$ 明顯下滑",
        distractorFeedback: null
      },
      {
        key: "B",
        text: "總變異量 $SST$ 會因變數增加而等比例放大",
        distractorFeedback: "SST 僅由依變數 Y 自身決定，自變數如何增減都不會改變 SST！"
      },
      {
        key: "C",
        text: "原始 $R^2$ 會因自由度懲罰而降低至 0.65 以下",
        distractorFeedback: "板書紅叉強調：原始 R² 單調不減，絕不可能因為加變數而下跌！"
      },
      {
        key: "D",
        text: "調整後判定係數 $R^2_{adj}$ 永遠不可能小於 0",
        distractorFeedback: "當模型極度惡劣時，R²_adj 是有可能被懲罰至負值的。"
      }
    ],
    correctAnswer: "A",
    formulaHint: "R^2_{adj} = 1 - \\left[ \\frac{SSE / (n - k - 1)}{SST / (n - 1)} \\right]",
    fullSolution: "【步驟一：板書核心論點】板書 IMG_0131 特別註明：「$R^2 \to$ 模型的解釋能力；資料多，解釋能力不一定上升！」\n【步驟二：數學機轉】每多加入一個變數，分母自由度 $n - k - 1$ 就減少 1。若新變數為雜訊，$SSE$ 縮小幅度極其微弱，無法彌補自由度的消耗，使得均方誤差 $MSE = SSE / (n-k-1)$ 變大，最終拉低 $R^2_{adj}$！\n【步驟三：結論】選項 (A) 完美詮釋了 $R^2_{adj}$ 防範過度配適的懲罰原理。",
    cramSummary: {
      conceptName: "R²_adj 懲罰雜訊變數",
      keyTakeaway: "瞎加無關變數：原始 R² 只升不降，但 R²_adj 必然受自由度懲罰而下跌！"
    }
  },
  {
    id: "q-u4-l4-01",
    unit: "ch06-regression",
    unitName: "迴歸分析與交互作用",
    level: 4,
    type: "numeric",
    title: "迴歸變異數分析表 (ANOVA Table) 與 F 檢定統計量重建",
    questionPrompt: "某顧問公司建立員工績效多元迴歸模型（自變數個數 $k = 3$，樣本數 $n = 34$）。\n已知該模型的迴歸變異數分析表摘要如下：\n- 總平方和 $SST = 800$\n- 殘差平方和 $SSE = 200$\n請依據變異數分析原理計算該多元迴歸模型的「整體檢定 $F$ 統計量（$F$-statistic）」（四捨五入至小數點後兩位）。",
    givenData: {
      "自變數個數 k": "3",
      "樣本數 n": "34",
      "總平方和 SST": "800",
      "殘差平方和 SSE": "200"
    },
    options: null,
    correctAnswer: 30.0,
    unitLabel: "",
    tolerance: 0.1,
    formulaHint: "F = \\frac{MSR}{MSE} = \\frac{SSR / k}{SSE / (n - k - 1)}",
    fullSolution: "【步驟一：變異量與自由度拆解】\n1. 迴歸平方和：$SSR = SST - SSE = 800 - 200 = 600$。\n2. 迴歸自由度：$df_R = k = 3$。\n3. 殘差自由度：$df_E = n - k - 1 = 34 - 3 - 1 = 30$。\n\n【步驟二：計算均方 (Mean Square)】\n- 迴歸均方：$MSR = \\frac{SSR}{df_R} = \\frac{600}{3} = 200.0$。\n- 殘差均方：$MSE = \\frac{SSE}{df_E} = \\frac{200}{30} = \\frac{20}{3} \\approx 6.6667$。\n\n【步驟三：計算 F 統計量】\n$F = \\frac{MSR}{MSE} = \\frac{200}{6.6667} = \\frac{200}{20/3} = 200 \\times \\frac{3}{20} = 30.0$。\n\n【步驟四：統計推論結論】\n$F = 30.0$ 遠大於臨界值，對應之 $p$-value 趨近於 0（遠小於 0.01），強烈拒絕虛無假說，代表整體迴歸模型極具顯著解釋力！",
    cramSummary: {
      conceptName: "ANOVA F 統計量手算",
      keyTakeaway: "SSR = 600, dfR = 3 -> MSR = 200。SSE = 200, dfE = 30 -> MSE = 6.6667。F = 200 / 6.6667 = 30.0。"
    }
  },

  // ==========================================
  // 單元五：線性規劃與敏感度分析 (ch10-lp)
  // ==========================================
  {
    id: "q-u5-l1-01",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 1,
    type: "mcq",
    title: "線性規劃特例診斷辨析",
    questionPrompt: "某製造商建立線性規劃求解產品配置以獲取利潤最大化。在圖解法求解時發現：「目標函數的等利潤線在可行解區域朝獲利方向無限平移時，永遠碰觸不到邊界封閉線，目標值可推進至無窮大」。此種情況在線性規劃中稱為：",
    givenData: null,
    options: [
      {
        key: "A",
        text: "不可行解 (Infeasible Solution)",
        distractorFeedback: "不可行解是指限制式交集為空集合，連一個解都沒有。"
      },
      {
        key: "B",
        text: "多重最佳解 (Alternative Optima)",
        distractorFeedback: "多重解是指等利潤線與某條邊界重合，目標值有限且相同。"
      },
      {
        key: "C",
        text: "無限制解 (Unbounded Solution)",
        distractorFeedback: null
      },
      {
        key: "D",
        text: "退化解 (Degenerate Solution)",
        distractorFeedback: "退化解是指多條限制式在同一頂點相交，差額變數為 0。"
      }
    ],
    correctAnswer: "C",
    formulaHint: "\\text{可行解區域朝目標方向開放無界} \\implies \\text{無限制解 (Unbounded)}",
    fullSolution: "【步驟一：定義核對】可行解空間在目標增長方向開放無界，目標函數值可以達到無限大，稱為「無限制解 (Unbounded)」。\n【步驟二：管理意涵】實務上出現無限制解，代表建模時「遺漏了關鍵的資源上限或市場產能限制式」。",
    cramSummary: {
      conceptName: "LP 特例：無限制解",
      keyTakeaway: "目標值可推到無限大 = 無限制解 (Unbounded)！通常代表漏列了資源上限限制式。"
    }
  },
  {
    id: "q-u5-l2-01",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 2,
    type: "numeric",
    title: "線性規劃圖解法最大利潤計算",
    questionPrompt: "考慮線性規劃問題：\n$$\\text{極大化 } Z = 3 x_1 + 5 x_2$$\n受限於：\n1. $2 x_1 + x_2 \\le 16$（資源 A）\n2. $x_1 + 2 x_2 \\le 14$（資源 B）\n3. $x_2 \\le 6$（市場上限）\n4. $x_1, x_2 \\ge 0$\n已知可行解頂點包含：$(0, 0), (0, 6), (2, 6), (6, 4), (8, 0)$。請計算本問題之「最大目標利潤值 Z*」。",
    givenData: {
      "目標函數": "Max Z = 3*x1 + 5*x2",
      "可行頂點坐標": "A(0,0), B(0,6), C(2,6), D(6,4), E(8,0)"
    },
    options: null,
    correctAnswer: 38,
    unitLabel: "萬元",
    tolerance: 0.1,
    formulaHint: "Z(D) = 3(6) + 5(4) = 18 + 20 = 38",
    fullSolution: "【步驟一：逐一將頂點代入目標函數 Z = 3x1 + 5x2】\n- 點 A(0, 0): $Z = 3(0) + 5(0) = 0$\n- 點 B(0, 6): $Z = 3(0) + 5(6) = 30$\n- 點 C(2, 6): $Z = 3(2) + 5(6) = 6 + 30 = 36$\n- 點 D(6, 4): $Z = 3(6) + 5(4) = 18 + 20 = 38$（最大！）\n- 點 E(8, 0): $Z = 3(8) + 5(0) = 24$\n【步驟二：結論】最佳頂點為 $(6, 4)$，最大目標值 $Z^* = 38$ 萬元。",
    cramSummary: {
      conceptName: "LP 頂點代入求極值",
      keyTakeaway: "極值點定理：最佳解必在頂點！逐一代入比較：Z(6,4) = 3*6 + 5*4 = 38 最高。"
    }
  },
  {
    id: "q-u5-l3-01",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 3,
    type: "numeric",
    title: "線性規劃極小化 (Min) 總成本求解",
    questionPrompt: "某倉儲中心配置無人車搬運路徑：\n$$\\text{極小化總成本 } Z = 3 X_1 + 4 X_2$$\n受限於：\n1. $2 X_1 + 3 X_2 \\ge 12$（每日最低搬運量）\n2. $X_1 + X_2 \\ge 5$（高峰調度保證）\n3. $X_1, X_2 \\ge 0$\n可行解區域邊界頂點為：$A(0, 5), B(3, 2), C(6, 0)$。請求出本問題之「最低總成本 Z*」。",
    givenData: {
      "目標函數": "Min Z = 3*X1 + 4*X2",
      "限制式邊界": "2*X1 + 3*X2 >= 12, X1 + X2 >= 5",
      "可行頂點": "A(0, 5), B(3, 2), C(6, 0)"
    },
    options: null,
    correctAnswer: 17,
    unitLabel: "萬元",
    tolerance: 0.1,
    formulaHint: "Z(B) = 3(3) + 4(2) = 9 + 8 = 17 \\text{ (求最小！)}",
    fullSolution: "【步驟一：檢驗極小化目標函數 Z = 3X1 + 4X2】\n- 頂點 A(0, 5): $Z = 3(0) + 4(5) = 20$\n- 頂點 B(3, 2): $Z = 3(3) + 4(2) = 9 + 8 = 17$（最小！）\n- 頂點 C(6, 0): $Z = 3(6) + 4(0) = 18$\n【步驟二：超額變數檢驗】代入 $B(3, 2)$：\n- 限制 1：$2(3) + 3(2) = 12 \\ge 12 \\implies E_1 = 0$（耗盡 Binding）\n- 限制 2：$3 + 2 = 5 \\ge 5 \\implies E_2 = 0$（耗盡 Binding）\n【步驟三：結論】最佳解為 $(3, 2)$，最低總成本 $Z^* = 17$ 萬元。",
    cramSummary: {
      conceptName: "LP 極小化圖解法",
      keyTakeaway: "Min 問題往原點方向壓！代入各頂點選最小：Z(3,2) = 3*3 + 4*2 = 17。"
    }
  },
  {
    id: "q-u5-l3-02",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 3,
    type: "self-check",
    title: "目標函數係數 c1 最佳解範圍（斜率夾擠分析）",
    questionPrompt: "承接問題：$\\text{Max } Z = c_1 x_1 + 5 x_2$，已知最佳頂點落在點 $D(6, 4)$，該點由兩條緊縮限制線相交而成：\n- 邊界一：$x_1 + 2 x_2 = 14$（斜率 $m_1 = -1/2$）\n- 邊界二：$2 x_1 + x_2 = 16$（斜率 $m_2 = -2$）\n若欲使原最佳頂點 $D(6, 4)$ 維持不變，請求出目標函數係數 $c_1$ 的允許變動範圍（Range of Optimality）。",
    givenData: {
      "目標線斜率": "m_Z = -c1 / 5",
      "相交邊界斜率": "m1 = -1/2, m2 = -2"
    },
    formulaHint: "-2 \\le -\\frac{c_1}{5} \\le -\\frac{1}{2} \\iff 2.5 \\le c_1 \\le 10",
    fullSolution: "【步驟一：等利潤線斜率】\n目標函數 $Z = c_1 x_1 + 5 x_2 \\implies x_2 = -\\frac{c_1}{5} x_1 + \\frac{Z}{5}$，斜率為 $m_Z = -\\frac{c_1}{5}$。\n【步驟二：建立斜率夾擠不等式】\n為使最佳解鎖定於交點 D，等利潤線斜率必須夾在兩相交邊界斜率之間：\n$$-2 \\le -\\frac{c_1}{5} \\le -\\frac{1}{2}$$\n【步驟三：解不等式】\n同乘以 $-5$（注意負數相乘，不等號必須反向）：\n$$10 \\ge c_1 \\ge 2.5 \\iff 2.5 \\le c_1 \\le 10$$\n【步驟四：管理意涵】只要產品 1 的單位利潤 $c_1$ 保持在 2.5 到 10 萬元之間，最優生產排程維持 $(6, 4)$ 完全不變！",
    cramSummary: {
      conceptName: "敏感度斜率夾擠法",
      keyTakeaway: "目標線斜率 -c1/c2 夾在相交兩邊界斜率之間！同乘負數不等號記得轉向：2.5 ≤ c1 ≤ 10。"
    }
  },
  {
    id: "q-u5-l4-01",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 4,
    type: "self-check",
    title: "作業必出魔王題：科學園區三廠區公平限水比例限制式建模",
    questionPrompt: "【情境描述】科學園區管委會為三個相連半導體晶圓廠區（A, B, C）規劃生產面積。各廠區資源為：\n- 廠區 A：廠房面積 12 公頃，配水 24 萬噸\n- 廠區 B：廠房面積 8 公頃，配水 18 萬噸\n- 廠區 C：廠房面積 10 公頃，配水 15 萬噸\n規劃生產產品 1（用水 3 萬噸/公頃，利潤 120 萬元/公頃）與產品 2（用水 1.5 萬噸/公頃，利潤 90 萬元/公頃，全區總產量上限 15 公頃）。\n【公平條款】**三個廠區各自的「總生產面積與其廠房面積」的比例要求完全相等**。\n請寫出本問題的完整線性規劃模式（決策變數、目標函數、面積限制、水量限制、總產量限制、公平比例限制式）。",
    givenData: {
      "廠房面積": "A: 12, B: 8, C: 10 公頃",
      "配水上限": "A: 24, B: 18, C: 15 萬噸",
      "用水需求": "產品1: 3.0, 產品2: 1.5 萬噸/公頃",
      "單位利潤": "產品1: 120, 產品2: 90 萬元/公頃"
    },
    formulaHint: "\\frac{x_{A1} + x_{A2}}{12} = \\frac{x_{B1} + x_{B2}}{8} = \\frac{x_{C1} + x_{C2}}{10}",
    fullSolution: "【Step 1：定義決策變數】\n令 $x_{ij}$ 代表廠區 $i$ 生產產品 $j$ 的面積（公頃），$i \\in \\{A, B, C\\}, j \\in \\{1, 2\\}$。\n\n【Step 2：目標函數】\n管委會追求總利潤極大化（切勿打成極小化！）：\n$$\\text{Max } Z = 120(x_{A1} + x_{B1} + x_{C1}) + 90(x_{A2} + x_{B2} + x_{C2})$$\n\n【Step 3：各廠區廠房面積上限】\n- A: $x_{A1} + x_{A2} \\le 12$\n- B: $x_{B1} + x_{B2} \\le 8$\n- C: $x_{C1} + x_{C2} \\le 10$\n\n【Step 4：各廠區分配水量限制】\n- A: $3.0 x_{A1} + 1.5 x_{A2} \\le 24$\n- B: $3.0 x_{B1} + 1.5 x_{B2} \\le 18$\n- C: $3.0 x_{C1} + 1.5 x_{C2} \\le 15$\n\n【Step 5：市場總生產上限】\n- $x_{A2} + x_{B2} + x_{C2} \\le 15$\n\n【Step 6：魔王考點—公平比例限制式線性化】\n題目要求：$\\frac{x_{A1} + x_{A2}}{12} = \\frac{x_{B1} + x_{B2}}{8} = \\frac{x_{C1} + x_{C2}}{10}$。\n- 拆解式一（A 與 B 比）：\n  $$8(x_{A1} + x_{A2}) = 12(x_{B1} + x_{B2}) \\iff 2 x_{A1} + 2 x_{A2} - 3 x_{B1} - 3 x_{B2} = 0$$\n- 拆解式二（B 與 C 比）：\n  $$10(x_{B1} + x_{B2}) = 8(x_{C1} + x_{C2}) \\iff 5 x_{B1} + 5 x_{B2} - 4 x_{C1} - 4 x_{C2} = 0$$\n\n【Step 7：非負約束】\n$$x_{ij} \\ge 0, \\quad \\forall i, j$$",
    cramSummary: {
      conceptName: "公平比例限制式交叉相乘",
      keyTakeaway: "比例等式切忌留分母！連比例 A/12 = B/8 = C/10 必須兩兩交叉相乘化為標準無分母線性等式 (=0)。"
    }
  },

  {
    id: "q-u5-l1-02",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 1,
    type: "mcq",
    title: "極值點定理與等利潤線平移法幾何意涵",
    questionPrompt: "在雙變數線性規劃（$x_1, x_2 \\ge 0$）的圖解法求解過程中，關於「可行解區域」與「最佳解」的幾何關係，下列敘述何者完全正確？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "若線性規劃問題存在唯一最佳解，則該解必然位於可行解多邊形的內部幾何中心",
        distractorFeedback: "錯誤！線性函數的極值必然發生在多邊形的外圍邊界或頂點，不可能在內部中心。"
      },
      {
        key: "B",
        text: "最佳解必出現在可行解區域的頂點（極值點）；若等利潤線與某條緊縮邊界線平行重合，則存在多重最佳解",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "可行解區域必定為非凸多邊形，故最佳解可能出現在任何凹角處",
        distractorFeedback: "線性不等式交集之可行解區域保證為『凸多邊形 (Convex)』，絕無凹角。"
      },
      {
        key: "D",
        text: "只有當所有限制條件皆為等號時，才能使用等利潤線平移法",
        distractorFeedback: "不等式限制式才是圖解法最典型的應用場景。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "\\text{Extreme Point Theorem: Optima at Corner Points}",
    fullSolution: "【步驟一：極值點定理 (Corner Point Theorem)】\n由於目標函數與限制條件皆為線性，可行解空間必定為凸集合（Convex Set）。最佳解若存在，必然出現在可行解多邊形的頂點（極值點）上！\n【步驟二：多重最佳解幾何條件】\n若等利潤線的斜率恰好等於某條緊縮限制線的斜率，當等利潤線平移至該邊界時，整條線段上的所有點皆產生相同的最大利潤，此時具備無限多組最佳解（多重最佳解）。\n【步驟三：結論】選項 (B) 完全正確。",
    cramSummary: {
      conceptName: "極值點定理與多重解",
      keyTakeaway: "最佳解必在頂點！若等利潤線與邊界斜率重合平行，則產生多重最佳解。"
    }
  },
  {
    id: "q-u5-l2-02",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 2,
    type: "numeric",
    title: "超額變數 (Surplus Variable) 計算",
    questionPrompt: "某營養調配問題要求每日蛋白質最低攝取量限制為：$$4 x_1 + 5 x_2 \\ge 60$$\n目前調配方案決定使用 $x_1 = 10$ 單位的第一種食材與 $x_2 = 6$ 單位的第二種食材。請計算該限制條件在目前方案下的「超額變數（Surplus Variable $E_1$）」數值。",
    givenData: {
      "限制條件": "4*x1 + 5*x2 >= 60",
      "目前解 (x1, x2)": "(10, 6)"
    },
    options: null,
    correctAnswer: 10.0,
    unitLabel: "單位",
    tolerance: 0.05,
    formulaHint: "a_1 x_1 + a_2 x_2 - E_1 = b_1 \\iff E_1 = a_1 x_1 + a_2 x_2 - b_1",
    fullSolution: "【步驟一：超額變數定義】\n對於「$\\ge$」大於等於型限制式，超額變數 $E_1 \\ge 0$ 代表實際提供量超越最低門檻的超額部分，標準式為：\n$4 x_1 + 5 x_2 - E_1 = 60$。\n【步驟二：代入目前方案坐標】\n實際提供量 $= 4(10) + 5(6) = 40 + 30 = 70$ 單位。\n【步驟三：計算超額量】\n$E_1 = 70 - 60 = 10$ 單位。\n【步驟四：結論】超額變數為 10 單位（代表比每日最低門檻多攝取了 10 單位蛋白質）。",
    cramSummary: {
      conceptName: "超額變數 E 計算",
      keyTakeaway: ">= 限制式扣除超額變數 E。E = 實際值 - 門檻 = 70 - 60 = 10。"
    }
  },
  {
    id: "q-u5-l3-03",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 3,
    type: "numeric",
    title: "敏感度分析目標函數係數容許變動上限",
    questionPrompt: "某工廠求解生產利潤極大化：$\\text{Max } Z = c_1 x_1 + 30 x_2$。\n圖解法求得唯一最佳解出現在兩條緊縮限制線的交點頂點：\n- 限制線 1：$2 x_1 + 3 x_2 = 120$（斜率 $m_1 = -2/3$）\n- 限制線 2：$4 x_1 + 2 x_2 = 160$（斜率 $m_2 = -4/2 = -2$）\n根據斜率夾擠準則，目標函數線斜率 $-\\frac{c_1}{30}$ 必須介於兩邊界斜率之間（$-2 \\le -\\frac{c_1}{30} \\le -\\frac{2}{3}$）。\n請計算在維持該頂點坐標為最佳解的前提下，產品 1 的單位利潤 $c_1$ 之「容許變動上限（Maximum Allowable Value）」。",
    givenData: {
      "目標函數": "Max Z = c1*x1 + 30*x2",
      "限制線 1 斜率 m1": "-2/3",
      "限制線 2 斜率 m2": "-2"
    },
    options: null,
    correctAnswer: 60.0,
    unitLabel: "元",
    tolerance: 0.1,
    formulaHint: "-2 \\le -\\frac{c_1}{30} \\le -\\frac{2}{3} \\iff 20 \\le c_1 \\le 60",
    fullSolution: "【步驟一：列出斜率夾擠不等式】\n目標函數等利潤線斜率為 $m_{obj} = -\\frac{c_1}{c_2} = -\\frac{c_1}{30}$。\n為維持交點頂點為唯一最佳解，目標斜率必須夾在兩條緊縮限制線斜率之間：\n$$-2 \\le -\\frac{c_1}{30} \\le -\\frac{2}{3}$$\n\n【步驟二：兩端同乘 -30（注意不等號轉向）】\n$$(-2) \\times (-30) \\ge c_1 \\ge \\left(-\\frac{2}{3}\\right) \\times (-30)$$\n$$60 \\ge c_1 \\ge 20 \\iff 20 \\le c_1 \\le 60$$\n\n【步驟三：求容許上限】\n$c_1$ 的容許範圍為 $[20, 60]$，故容許上限為 60 元。\n若 $c_1 > 60$，等利潤線會過度陡峭，最佳解將跳躍轉移至其他頂點！",
    cramSummary: {
      conceptName: "敏感度係數斜率夾擠",
      keyTakeaway: "斜率夾擠 -2 <= -c1/30 <= -2/3。同乘 -30 轉向得 20 <= c1 <= 60。上限為 60。"
    }
  },
  {
    id: "q-u5-l4-02",
    unit: "ch10-lp",
    unitName: "線性規劃與敏感度分析",
    level: 4,
    type: "numeric",
    title: "影子價格 (Shadow Price) 與產能擴充利潤效益評估",
    questionPrompt: "某機械製造商求解生產線性規劃，最佳解總利潤為 $Z^* = 45,000$ 元。系統敏感度報表顯示：\n- 限制式 1（組裝機時上限 200 小時）：屬於緊縮限制，影子價格（Dual Price）為每小時 $150$ 元，容許增加量為 $40$ 小時。\n- 限制式 2（測試機時上限 160 小時）：屬於非緊縮限制，差額變數（Slack）為 $25$ 小時，影子價格為 $0$ 元。\n今生產部主管若花費總成本 $3,000$ 元租賃設備，將組裝機時上限增加 $30$ 小時（仍在容許範圍內），請問扣除租賃成本後，公司能獲得的「淨利潤增加額」為何（元）？",
    givenData: {
      "組裝機時影子價格": "150 元/小時",
      "增加組裝工時": "30 小時",
      "設備租賃成本": "3,000 元",
      "測試機時影子價格": "0 元/小時"
    },
    options: null,
    correctAnswer: 1500.0,
    unitLabel: "元",
    tolerance: 1.0,
    formulaHint: "\\Delta Z = (\\text{Shadow Price} \\times \\Delta b) - \\text{Cost}",
    fullSolution: "【步驟一：理解影子價格之經濟意涵】\n影子價格代表在容許變動範圍內，該項資源上限每增加 1 單位，目標利潤 $Z$ 可增加之邊際金額。\n本題組裝機時為緊縮限制，每多 1 小時可多賺 150 元。\n\n【步驟二：計算總營收/毛利增加額】\n增加 30 小時組裝機時（小於容許上限 40 小時，影子價格依然有效）：\n$\\Delta Z_{gross} = 150 \\text{ 元/小時} \\times 30 \\text{ 小時} = 4,500$ 元。\n\n【步驟三：扣除取得該資源之租賃成本】\n淨利潤增加額 $= 4,500 - 3,000 = 1,500$ 元。\n\n【步驟四：商務決策結論】\n淨利潤增加 1,500 元為正值，此擴充產能決策在經濟效益上完全可行且值得執行！",
    cramSummary: {
      conceptName: "影子價格擴產效益",
      keyTakeaway: "毛利增加 = 影子價格 150 * 30 = 4,500。淨利增加 = 4,500 - 成本 3,000 = 1,500 元。"
    }
  },

  // ==========================================
  // ==========================================
  // 單元六：不確定情況下之決策準則 (ch13-decision)
  // (嚴格鎖定 13.2 決策準則：Maximax, Maximin, Laplace, Minimax Regret；決策樹與 EVSI 100% 排除！)
  // ==========================================
  {
    id: "q-u6-l1-01",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 1,
    type: "mcq",
    title: "最大機會損失最小化 (Minimax Regret) 哲學辨析",
    questionPrompt: "決策者面對報酬矩陣（付償值為利潤）時，若採取「最大機會損失最小化準則（Minimax Regret）」，其決策心態與計算核心哲學為何？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "在最差的情境中挑選最好的結果，展現徹底的風險厭惡保守心態",
        distractorFeedback: "這是悲觀準則 (Maximin)。"
      },
      {
        key: "B",
        text: "假設各種自然情境發生的機率完全相同，追求期望獲利極大化",
        distractorFeedback: "這是機率均等準則 (Laplace)。"
      },
      {
        key: "C",
        text: "在每一情境下計算未選到最佳方案所產生的後悔值，再從各方案的最壞後悔中選出衝擊最小者",
        distractorFeedback: null
      },
      {
        key: "D",
        text: "孤注一擲，只挑選全矩陣中出現的最大可能獲利方案",
        distractorFeedback: "這是樂觀準則 (Maximax)。"
      }
    ],
    correctAnswer: "C",
    formulaHint: "R(d_i, s_j) = \\max_k V(d_k, s_j) - V(d_i, s_j), \\quad \\min_i \\left( \\max_j R(d_i, s_j) \\right)",
    fullSolution: "【步驟一：機會損失定義】若真實情境為 $s_j$，因為沒挑到當期最佳決策所平白損失的利益，稱為機會損失（遺憾值）。\n【步驟二：兩階段步驟】\n1. 每行取最大利潤減該格數值，建構遺憾矩陣；\n2. 挑出每個方案列上的「最大遺憾值」；\n3. 從這些最大遺憾中，挑選數值「最小者」（事後後悔感最小化）。",
    cramSummary: {
      conceptName: "Minimax Regret 決策哲學",
      keyTakeaway: "事後後悔最小化！行最大減該格建遺憾矩陣 -> 找各方案最大遺憾 -> 取最小者。"
    }
  },
  {
    id: "q-u6-l1-02",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 1,
    type: "mcq",
    title: "成本矩陣與利潤矩陣之不確定準則差異辨析",
    questionPrompt: "在決策分析中，當報酬矩陣的數值代表「生產成本（數值越小越好）」而非「營業利潤（數值越大越好）」時，關於 13.2 不確定情況下決策準則之應用，下列敘述何者完全正確？",
    givenData: null,
    options: [
      {
        key: "A",
        text: "無論利潤或成本矩陣，樂觀準則恆為尋找各方案最大值中之最大者 (Maximax)",
        distractorFeedback: "成本情境下成本越低越好，樂觀者期盼成本最低，應採小中取小 (Minimin)。"
      },
      {
        key: "B",
        text: "成本矩陣下，樂觀準則為小中取小 (Minimin)；悲觀準則為防範最壞情境，應挑選各方案最大成本中之最小者 (Minimax)",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "成本矩陣因數值皆為支出，無法計算機會損失（遺憾值）",
        distractorFeedback: "成本矩陣同樣可算機會損失：該情境下該方案成本減去該情境最低成本。"
      },
      {
        key: "D",
        text: "機率均等準則 (Laplace) 在成本矩陣下應選擇各情境平均成本最高之方案",
        distractorFeedback: "成本矩陣下，Laplace 準則應選擇平均成本「最低」之方案。"
      }
    ],
    correctAnswer: "B",
    formulaHint: "\\text{利潤: 樂觀=Maximax, 悲觀=Maximin；成本: 樂觀=Minimin, 悲觀=Minimax}",
    fullSolution: "【步驟一：利潤矩陣（望大）vs. 成本矩陣（望小）】\n- 利潤矩陣：數值代表營收或獲利，追求極大化。\n  * 樂觀準則：大中取大 (Maximax)。\n  * 悲觀準則：小中取大 (Maximin)。\n- 成本矩陣：數值代表支出或損耗，追求極小化。\n  * 樂觀準則：極度樂觀期盼成本最低，採「小中取小 (Minimin)」。\n  * 悲觀準則：保守防守、規避最大災難，先看各方案的最壞情況（各列最大成本），再從中挑選最小者，採「大中取小 (Minimax)」。\n\n【步驟二：結論】選項 (B) 敘述完全正確。",
    cramSummary: {
      conceptName: "成本矩陣 vs 利潤矩陣準則對照",
      keyTakeaway: "利潤望大：樂觀=大中取大(Maximax)，悲觀=小中取大(Maximin)。成本望小：樂觀=小中取小(Minimin)，悲觀=大中取小(Minimax)！"
    }
  },
  {
    id: "q-u6-l2-01",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 2,
    type: "mcq",
    title: "不確定準則快速判讀（樂觀 / 悲觀 / Laplace）",
    questionPrompt: "給定投資專案在三種景氣下的獲利報酬矩陣如下表：\n\n| 方案 \\ 景氣 | 繁榮 (S1) | 平平 (S2) | 蕭條 (S3) |\n| :--- | :---: | :---: | :---: |\n| 方案 A | 100 | 40 | -20 |\n| 方案 B | 70 | 50 | 10 |\n| 方案 C | 50 | 50 | 40 |\n\n若依據「悲觀準則 (Maximin)」，決策者應選擇哪一個方案？",
    givenData: {
      "方案 A 獲利": "[100, 40, -20]",
      "方案 B 獲利": "[70, 50, 10]",
      "方案 C 獲利": "[50, 50, 40]"
    },
    options: [
      {
        key: "A",
        text: "方案 A",
        distractorFeedback: "方案 A 在最差景氣下會虧損 -20，悲觀準則絕不選它。"
      },
      {
        key: "B",
        text: "方案 B",
        distractorFeedback: "方案 B 最差為 10，方案 C 最差為 40，40 > 10。"
      },
      {
        key: "C",
        text: "方案 C",
        distractorFeedback: null
      },
      {
        key: "D",
        text: "方案 A 與方案 B 皆可",
        distractorFeedback: "兩者最差值皆不如方案 C。"
      }
    ],
    correctAnswer: "C",
    formulaHint: "\\max_i \\left( \\min_j V(d_i, s_j) \\right)",
    fullSolution: "【步驟一：悲觀準則心態】防守保守，先找出各方案在最差情境下的最低獲利。\n- 方案 A 最小值：$\\min(100, 40, -20) = -20$\n- 方案 B 最小值：$\\min(70, 50, 10) = 10$\n- 方案 C 最小值：$\\min(50, 50, 40) = 40$\n【步驟二：從最差中挑最好】\n在最差獲利 $\\{-20, 10, 40\\}$ 中，最大值為 $40$（方案 C）。\n【步驟三：結論】悲觀準則下必選「方案 C」。",
    cramSummary: {
      conceptName: "Maximin 悲觀準則速判",
      keyTakeaway: "各列挑最小：A=-20, B=10, C=40。再挑最大：40 最高，選方案 C！"
    }
  },
  {
    id: "q-u6-l2-02",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 2,
    type: "numeric",
    title: "機會損失 (後悔值) 快速計算",
    questionPrompt: "某超商面對兩種天氣（晴天 S1、雨天 S2）的冰品叫貨獲利矩陣如下：\n- 方案 A（大量叫貨）：晴天獲利 80 萬元，雨天獲利 10 萬元\n- 方案 B（保守叫貨）：晴天獲利 45 萬元，雨天獲利 35 萬元\n若最終大自然為「雨天 (S2)」，而超商當初選擇了「方案 A」，請問該方案在雨天情境下所產生的「機會損失（後悔值 Regret）」為多少萬元？",
    givenData: {
      "方案 A 獲利 (晴天, 雨天)": "(80, 10)",
      "方案 B 獲利 (晴天, 雨天)": "(45, 35)",
      "實際發生情境": "雨天 (S2)"
    },
    options: null,
    correctAnswer: 25.0,
    unitLabel: "萬元",
    tolerance: 0.05,
    formulaHint: "R_{ij} = \\max_k(V_{kj}) - V_{ij}",
    fullSolution: "【步驟一：找出雨天 (S2) 情境下的全場最大獲利】\n- 方案 A 獲利：10 萬元\n- 方案 B 獲利：35 萬元\n雨天最大獲利 $M_2 = \\max(10, 35) = 35$ 萬元（即當天下雨時，最佳選擇是方案 B）。\n\n【步驟二：計算方案 A 的後悔值】\n後悔值 = 該狀態最佳獲利 - 方案 A 獲利：\n$R_{A, S2} = 35 - 10 = 25$ 萬元。\n\n【步驟三：結論】\n方案 A 在雨天時產生的機會損失為 25 萬元。",
    cramSummary: {
      conceptName: "機會損失單格外算法",
      keyTakeaway: "後悔值 = 該列/欄最佳 - 當前方案。雨天最佳 35，方案 A 拿 10，後悔 35 - 10 = 25 萬。"
    }
  },
  {
    id: "q-u6-l2-03",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 2,
    type: "numeric",
    title: "機率均等準則 (Laplace Criterion) 方案平均獲利計算",
    questionPrompt: "某零售商面對三種可能市場景氣（繁榮 S1、平平 S2、衰退 S3），考慮推出新策略 A。在三種景氣下的獲利預估如下：\n- 繁榮 S1：獲利 180 萬元\n- 平平 S2：獲利 90 萬元\n- 衰退 S3：獲利 30 萬元\n在完全無法預知各景氣發生機率的不確定情況下，若決策者採「機率均等準則（Laplace Criterion）」，請計算策略 A 的期望平均獲利為多少萬元？",
    givenData: {
      "繁榮 S1 獲利": "180 萬元",
      "平平 S2 獲利": "90 萬元",
      "衰退 S3 獲利": "30 萬元"
    },
    options: null,
    correctAnswer: 100.0,
    unitLabel: "萬元",
    tolerance: 0.1,
    formulaHint: "Avg(d_i) = \\frac{1}{N} \\sum_{j=1}^N V(d_i, s_j)",
    fullSolution: "【步驟一：機率均等準則原理】\n根據充分理由原則（Principle of Insufficient Reason），若無足夠資訊認定哪種情境更容易發生，則假設各情境發生機率相等（$P = 1/3$）。\n\n【步驟二：計算算術平均獲利】\n$$Avg(A) = \\frac{180 + 90 + 30}{3} = \\frac{300}{3} = 100.0\\text{ 萬元}$$\n\n【步驟三：結論】策略 A 之 Laplace 平均期望獲利為 100.0 萬元。",
    cramSummary: {
      conceptName: "Laplace 均等獲利計算",
      keyTakeaway: "Laplace 準則假設各狀態等機率：(180 + 90 + 30) / 3 = 100.0 萬元。"
    }
  },
  {
    id: "q-u6-l3-01",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 3,
    type: "mcq",
    title: "最大機會損失最小化矩陣完整求解",
    questionPrompt: "某製造商評估四種擴產策略（S1 不擴、S2 小擴、S3 中擴、S4 大擴），市場需求報酬矩陣如下表：\n\n| 方案 \\ 需求 | 高需求 (D1) | 中需求 (D2) | 低需求 (D3) |\n| :--- | :---: | :---: | :---: |\n| S1 (不擴) | 50 | 50 | 50 |\n| S2 (小擴) | 120 | 80 | 40 |\n| S3 (中擴) | 180 | 110 | 10 |\n| S4 (大擴) | 250 | 90 | -30 |\n\n請依「最大機會損失最小化準則（Minimax Regret）」計算遺憾矩陣，指出應挑選之最佳擴產策略與其最大機會損失數值。",
    givenData: {
      "高需求 D1 各方案獲利": "S1:50, S2:120, S3:180, S4:250",
      "中需求 D2 各方案獲利": "S1:50, S2:80, S3:110, S4:90",
      "低需求 D3 各方案獲利": "S1:50, S2:40, S3:10, S4:-30"
    },
    options: [
      {
        key: "A",
        text: "挑選 S1，最大機會損失為 50",
        distractorFeedback: "S1 最大遺憾為 200，非 50。"
      },
      {
        key: "B",
        text: "挑選 S2，最大機會損失為 130",
        distractorFeedback: "S2 最大遺憾為 130，但 70 < 130，S3 遺憾更小。"
      },
      {
        key: "C",
        text: "挑選 S3 (中度擴產)，其最大機會損失為 70",
        distractorFeedback: null
      },
      {
        key: "D",
        text: "挑選 S4 (大幅擴產)，其最大機會損失為 80",
        distractorFeedback: "S4 最大遺憾為 80，70 < 80，S3 遺憾更小。"
      }
    ],
    correctAnswer: "C",
    formulaHint: "R(d_i, s_j) = \\text{行最大} - \\text{該格獲利}",
    fullSolution: "【步驟一：找出各情境行最大值】\n- D1 最大：$\\max(50, 120, 180, 250) = 250$\n- D2 最大：$\\max(50, 80, 110, 90) = 110$\n- D3 最大：$\\max(50, 40, 10, -30) = 50$\n\n【步驟二：建構機會損失矩陣並找方案最大遺憾】\n- S1: D1(250-50=200), D2(110-50=60), D3(50-50=0) -> 最大遺憾 = 200\n- S2: D1(250-120=130), D2(110-80=30), D3(50-40=10) -> 最大遺憾 = 130\n- S3: D1(250-180=70), D2(110-110=0), D3(50-10=40) -> 最大遺憾 = 70\n- S4: D1(250-250=0), D2(110-90=20), D3(50-(-30)=80) -> 最大遺憾 = 80\n\n【步驟三：選最大遺憾中最小者】\n各方案最大遺憾為 $\\{200, 130, 70, 80\\}$，最小值為 70，對應方案為 S3 (中度擴產)。",
    cramSummary: {
      conceptName: "Minimax Regret 矩陣完整計算",
      keyTakeaway: "各方案最大遺憾：S1=200, S2=130, S3=70, S4=80。選最小者：70 (S3)！"
    }
  },
  {
    id: "q-u6-l3-02",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 3,
    type: "numeric",
    title: "成本矩陣下之最大機會損失 (Minimax Regret) 手算",
    questionPrompt: "某物流公司考慮三種配送車隊擴建方案（D1, D2, D3），未來面臨三種油價情境（S1 低油價、S2 中油價、S3 高油價）的「營運總成本矩陣（萬元）」如下：\n- D1 方案成本：S1=40, S2=65, S3=90\n- D2 方案成本：S1=50, S2=60, S3=80\n- D3 方案成本：S1=70, S2=70, S3=75\n在「最大機會損失最小化準則」下，各情境的理想基準為該情境之「最低成本」。請問最優決策方案的「最大機會損失」數值為多少萬元？",
    givenData: {
      "D1 成本 (S1, S2, S3)": "(40, 65, 90)",
      "D2 成本 (S1, S2, S3)": "(50, 60, 80)",
      "D3 成本 (S1, S2, S3)": "(70, 70, 75)"
    },
    options: null,
    correctAnswer: 10.0,
    unitLabel: "萬元",
    tolerance: 0.1,
    formulaHint: "R(d_i, s_j) = C(d_i, s_j) - \\min_k C(d_k, s_j)",
    fullSolution: "【步驟一：找出各情境行之最低成本（最佳基準）】\n- S1 低油價最低成本：$\\min(40, 50, 70) = 40$\n- S2 中油價最低成本：$\\min(65, 60, 70) = 60$\n- S3 高油價最低成本：$\\min(90, 80, 75) = 75$\n\n【步驟二：建構成本矩陣之機會損失（後悔值）】\n注意：成本情境下，遺憾值 $= \\text{當前方案成本} - \\text{行最低成本}$：\n- D1: S1(40-40=0), S2(65-60=5), S3(90-75=15) $\\implies$ 最大遺憾 $= 15$\n- D2: S1(50-40=10), S2(60-60=0), S3(80-75=5) $\\implies$ 最大遺憾 $= 10$\n- D3: S1(70-40=30), S2(70-60=10), S3(75-75=0) $\\implies$ 最大遺憾 $= 30$\n\n【步驟三：選取最大遺憾之最小者】\n各方案最大機會損失為 $\\{15, 10, 30\\}$，最小者為 10（對應方案為 D2）。\n故最優方案的最大機會損失為 10 萬元。",
    cramSummary: {
      conceptName: "成本矩陣後悔值計算",
      keyTakeaway: "成本遺憾 = 該格成本 - 行最低成本！最大遺憾：D1=15, D2=10, D3=30。最小為 10 (D2)！"
    }
  },
  {
    id: "q-u6-l4-01",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 4,
    type: "self-check",
    title: "作業必出魔王題：四策略三情境報酬矩陣與四種不確定決策準則綜合評估（作業 1107 題三實戰）",
    questionPrompt: "【情境描述】A 公司行銷經理評估四項促銷策略（S1, S2, S3, S4），競爭者 B 公司可能採取三種競爭行動（CA1, CA2, CA3）。在完全無法得知各行動機率下，獲利報酬矩陣（萬元）如下：\n- CA1：S1 = 13, S2 = 9, S3 = 24, S4 = 18\n- CA2：S1 = 14, S2 = 15, S3 = 21, S4 = 14\n- CA3：S1 = 11, S2 = 18, S3 = 15, S4 = 28\n【請依序完整推導回答以下四小題】：\n(1) 樂觀準則（Maximax）：列出各策略最大獲利，並指出所選策略。\n(2) 悲觀準則（Maximin）：列出各策略最差獲利，並指出所選策略。\n(3) 機率均等準則（Laplace）：計算各策略平均獲利，並指出所選策略。\n(4) 最大機會損失最小化準則（Minimax Regret）：請完整建構機會損失矩陣（Regret Matrix），列出各方案的最大機會損失數值，並指出最終選定之促銷策略與其最大遺憾值。（完全對齊作業 1107 第 3 題）",
    givenData: {
      "CA1 獲利 (S1, S2, S3, S4)": "(13, 9, 24, 18)",
      "CA2 獲利 (S1, S2, S3, S4)": "(14, 15, 21, 14)",
      "CA3 獲利 (S1, S2, S3, S4)": "(11, 18, 15, 28)"
    },
    formulaHint: "R(d_i, s_j) = \\max_k(V_{kj}) - V_{ij}",
    fullSolution: "【Step 1：樂觀準則 (Maximax)】\n- 尋求各方案在所有情境下的最大獲利：\n  * S1 最大獲利：$\\max(13, 14, 11) = 14$\n  * S2 最大獲利：$\\max(9, 15, 18) = 18$\n  * S3 最大獲利：$\\max(24, 21, 15) = 24$\n  * S4 最大獲利：$\\max(18, 14, 28) = 28$\n- 大中取大：$\\max(14, 18, 24, 28) = 28 \\implies$ **選擇策略 S4**。\n\n【Step 2：悲觀準則 (Maximin)】\n- 尋求各方案在所有情境下的最差（最小）獲利：\n  * S1 最差獲利：$\\min(13, 14, 11) = 11$\n  * S2 最差獲利：$\\min(9, 15, 18) = 9$\n  * S3 最差獲利：$\\min(24, 21, 15) = 15$\n  * S4 最差獲利：$\\min(18, 14, 28) = 14$\n- 小中取大（保底最好）：$\\max(11, 9, 15, 14) = 15 \\implies$ **選擇策略 S3**。\n\n【Step 3：機率均等準則 (Laplace)】\n- 假設 CA1, CA2, CA3 機率皆為 $1/3$，計算各方案平均獲利：\n  * $Avg(S1) = (13 + 14 + 11) / 3 = 38 / 3 \\approx 12.67$\n  * $Avg(S2) = (9 + 15 + 18) / 3 = 42 / 3 = 14.00$\n  * $Avg(S3) = (24 + 21 + 15) / 3 = 60 / 3 = 20.00$\n  * $Avg(S4) = (18 + 14 + 28) / 3 = 60 / 3 = 20.00$\n- 挑選平均最高者：$20.00 \\implies$ **策略 S3 與 S4 並列最佳**。\n\n【Step 4：最大機會損失最小化準則 (Minimax Regret)（作業 1107 題三原題）】\n1. 找出各情境行之最大獲利：\n   - CA1 行最大：$\\max(13, 9, 24, 18) = 24$\n   - CA2 行最大：$\\max(14, 15, 21, 14) = 21$\n   - CA3 行最大：$\\max(11, 18, 15, 28) = 28$\n2. 建構機會損失矩陣 $R_{ij} = \\text{行最大} - \\text{該格獲利}$：\n   - CA1：S1 = 24-13 = 11；S2 = 24-9 = 15；S3 = 24-24 = 0；S4 = 24-18 = 6\n   - CA2：S1 = 21-14 = 7；S2 = 21-15 = 6；S3 = 21-21 = 0；S4 = 21-14 = 7\n   - CA3：S1 = 28-11 = 17；S2 = 28-18 = 10；S3 = 28-15 = 13；S4 = 28-28 = 0\n3. 找出各策略之最大機會損失（列最大遺憾）：\n   - S1 最大遺憾：$\\max(11, 7, 17) = 17$\n   - S2 最大遺憾：$\\max(15, 6, 10) = 15$\n   - S3 最大遺憾：$\\max(0, 0, 13) = 13$\n   - S4 最大遺憾：$\\max(6, 7, 0) = 7$\n4. 選取最大遺憾之最小者：\n   $$\\min(17, 15, 13, 7) = 7$$\n   因此，在最大機會損失最小化準則下，行銷經理**必選策略 S4（其最大機會損失為 7）**！\n   *(完全吻合作業 1107 官方參考解答)*",
    cramSummary: {
      conceptName: "四準則綜合實戰評估 (作業1107題三)",
      keyTakeaway: "Maximax選S4(28)，Maximin選S3(15)，Laplace選S3&S4(20)，Minimax Regret選S4(最大遺憾7最小)！"
    }
  },
  {
    id: "q-u6-l4-02",
    unit: "ch13-decision",
    unitName: "不確定情況下之決策準則",
    level: 4,
    type: "numeric",
    title: "四策略不確定報酬矩陣之 Minimax Regret 最優解數值手算（作業 1107 題三）",
    questionPrompt: "承接作業 1107 題三情境：A 公司行銷經理評估促銷策略（S1-S4），面對 B 公司的三種競爭行動（CA1-CA3），獲利矩陣如下：\n- CA1：S1=13, S2=9, S3=24, S4=18\n- CA2：S1=14, S2=15, S3=21, S4=14\n- CA3：S1=11, S2=18, S3=15, S4=28\n請依據「最大機會損失最小化準則（Minimax Regret）」，計算出各策略的最大機會損失，並輸入最終所選定最優策略的「最大機會損失數值」（萬元）。",
    givenData: {
      "CA1 獲利 (S1, S2, S3, S4)": "(13, 9, 24, 18)",
      "CA2 獲利 (S1, S2, S3, S4)": "(14, 15, 21, 14)",
      "CA3 獲利 (S1, S2, S3, S4)": "(11, 18, 15, 28)"
    },
    options: null,
    correctAnswer: 7.0,
    unitLabel: "萬元",
    tolerance: 0.1,
    formulaHint: "\\min_i \\max_j [\\max_k V_{kj} - V_{ij}]",
    fullSolution: "【步驟一：找出各情境行最大值】\n- CA1 最大：24\n- CA2 最大：21\n- CA3 最大：28\n\n【步驟二：計算各策略的最大後悔值】\n- S1 最大後悔：$\\max(24-13, 21-14, 28-11) = \\max(11, 7, 17) = 17$\n- S2 最大後悔：$\\max(24-9, 21-15, 28-18) = \\max(15, 6, 10) = 15$\n- S3 最大後悔：$\\max(24-24, 21-21, 28-15) = \\max(0, 0, 13) = 13$\n- S4 最大後悔：$\\max(24-18, 21-14, 28-28) = \\max(6, 7, 0) = 7$\n\n【步驟三：取最小最大後悔值】\n各方案最大後悔值為 $\\{17, 15, 13, 7\\}$，最小值為 7，對應之最佳策略為 S4。\n故最優方案的最大機會損失為 7 萬元。",
    cramSummary: {
      conceptName: "Minimax Regret 矩陣數值精算",
      keyTakeaway: "各策略最大後悔：S1=17, S2=15, S3=13, S4=7。最小為 7 (選S4)！"
    }
  }
];

/**
 * 全面題庫動態參數生成器註冊表 (Comprehensive Dynamic Question Generators)
 * 涵蓋等級 2、等級 3 與等級 4 所有計算與推導題，防止死背答案
 */
// ==========================================
// 6大跨產業動態商業情境輪播資料庫 (Option B: Scenario Story Rotation)
// 涵蓋：手搖飲連鎖、生技新藥、半導體晶圓、電子商務、運動健身、雲端串流
// ==========================================
const STORY_SCENARIOS = [
  {
    industry: "手搖飲連鎖",
    company: "「茶韻鮮萃」手搖連鎖集團",
    item: "各旗艦門市單日現萃茶飲銷售杯數",
    unit: "杯",
    revenueContext: "手搖飲集團跨國拓點年度總營收",
    processItem: "門市特調飲品糖度檢測數值",
    processUnit: "度",
    firmGrowth: "手搖飲冷鏈物流中心資本額"
  },
  {
    industry: "生技新藥",
    company: "「達康生醫」臨床新藥研發公司",
    item: "臨床二期受試者血清抗體濃度效價",
    unit: "U/mL",
    revenueContext: "標靶新藥授權金與全球銷售權利金營收",
    processItem: "批次疫苗製劑純度百分比",
    processUnit: "%",
    firmGrowth: "生技新藥研發實驗室初期資本額"
  },
  {
    industry: "半導體晶圓",
    company: "「極光半導體」晶圓代工大廠",
    item: "12吋先進製程晶圓表面絕緣阻抗",
    unit: "歐姆",
    revenueContext: "先進封裝晶圓代工年營收",
    processItem: "晶圓表面薄膜平整厚度微米數",
    processUnit: "微米",
    firmGrowth: "第三代半導體晶圓廠擴廠資本"
  },
  {
    industry: "電子商務",
    company: "「購樂多商城」大型電商平台",
    item: "雙 11 大促銷活動各專案顧客留存天數",
    unit: "天",
    revenueContext: "跨境電子商務平台年度交易總額 (GMV)",
    processItem: "會員促銷滿額客單價數值",
    processUnit: "百元",
    firmGrowth: "跨境電商智慧倉儲設立資本額"
  },
  {
    industry: "運動健身",
    company: "「勁動智能健身」全國連鎖俱樂部",
    item: "VIP 會員單週高強度間歇運動燃脂大卡",
    unit: "大卡/10",
    revenueContext: "連鎖健身會館會費與私教課年營收",
    processItem: "運動員月均核心肌群重量訓練時數",
    processUnit: "小時",
    firmGrowth: "智能健身房旗艦館建置資本額"
  },
  {
    industry: "雲端串流",
    company: "「星視串流科技」影音雲端平台",
    item: "全球 CDN 伺服器節點平均響應延遲時間",
    unit: "毫秒",
    revenueContext: "影音串流平台全球付費訂閱年營收",
    processItem: "雲端機房伺服器尖峰算力負載率",
    processUnit: "%",
    firmGrowth: "高畫質影音串流雲端伺服器建置資本額"
  }
];

function pickStory() {
  return STORY_SCENARIOS[Math.floor(Math.random() * STORY_SCENARIOS.length)];
}

const DYNAMIC_GENERATORS = {
  // ==========================================
  // 單元一：敘述統計與位置量數 (包含 6 大產業故事輪播)
  // ==========================================
  "q-u1-l2-01": function(q) {
    const story = pickStory();
    const combos = [
      { v0: 1000, t: 3, ratio: 8, ans: 100 },
      { v0: 1600, t: 4, ratio: 5.0625, ans: 50 },
      { v0: 2000, t: 2, ratio: 2.25, ans: 50 },
      { v0: 2500, t: 2, ratio: 1.44, ans: 20 },
      { v0: 1000, t: 3, ratio: 1.728, ans: 20 },
      { v0: 4000, t: 2, ratio: 1.5625, ans: 25 },
      { v0: 2000, t: 3, ratio: 3.375, ans: 50 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    const vt = Math.round(pick.v0 * pick.ratio);
    return {
      givenData: {
        "產業情境": `${story.industry}（${story.company}）`,
        "期初營收 V0": `${pick.v0.toLocaleString()} 萬元`,
        "期末營收 Vt": `${vt.toLocaleString()} 萬元`,
        "跨越期數 t": `${pick.t} 年`
      },
      questionPrompt: `【${story.industry}跨國拓點】${story.company}之${story.revenueContext}由期初的 ${pick.v0.toLocaleString()} 萬元成長為期末的 ${vt.toLocaleString()} 萬元（跨越期數為 ${pick.t} 年）。請計算其營收年增率的幾何平均數（%）。`,
      correctAnswer: pick.ans,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解（${story.industry}場景）】\n$$\\text{CAGR} = \\left(\\frac{${vt}}{${pick.v0}}\\right)^{1/${pick.t}} - 1 = (${pick.ratio})^{1/${pick.t}} - 1 = ${1 + pick.ans/100} - 1 = ${pick.ans}\\%$$`
    };
  },

  "q-u1-l2-02": function(q) {
    const story = pickStory();
    const base = Math.floor(Math.random() * 15) + 10;
    const diffs = [5, 4, 6, 6, 6, 8, 10, 12];
    let nums = [base];
    for (let d of diffs) nums.push(nums[nums.length - 1] + d);
    const n = 9;
    const targets = [25, 40, 50, 70, 75];
    const x = targets[Math.floor(Math.random() * targets.length)];
    const L = (x / 100) * (n - 1) + 1;
    const p = Math.floor(L);
    const d = L - p;
    const x_p = nums[p - 1];
    const x_p1 = nums[p];
    const ans = Math.round((x_p + d * (x_p1 - x_p)) * 100) / 100;
    return {
      givenData: {
        "產業情境": `${story.industry}（${story.company}）`,
        "排序數列": `[${nums.join(", ")}]`,
        "樣本數 n": `${n}`,
        "目標百分位 x": `${x}`
      },
      questionPrompt: `【${story.industry}品管監控】${story.company}抽樣監控 9 筆「${story.item}」（單位：${story.unit}），數據由小至大排序如下：\n\`${nums.join(", ")}\`（$n = 9$）。\n請依課堂板書唯一標準公式求出「第 ${x} 百分位數對應之數值」。`,
      correctAnswer: ans,
      unitLabel: story.unit,
      tolerance: 0.05,
      fullSolution: `【動態題解（${story.industry}場景）】\n1. 板書位置公式：\n   $$L_{${x}} = \\frac{${x}}{100} \\times (9 - 1) + 1 = ${L.toFixed(2)}$$\n2. 整數項 $p = ${p}$，小數項 $0.d = ${d.toFixed(2)}$。\n3. 第 ${p} 筆為 ${x_p}，第 ${p+1} 筆為 ${x_p1}。\n4. 線性內插：\n   $$P_{${x}} = ${x_p} + ${d.toFixed(2)} \\times (${x_p1} - ${x_p}) = ${ans}$$`
    };
  },

  "q-u1-l2-03": function(q) {
    const story = pickStory();
    const centers = [20, 25, 30, 40, 50];
    const mean = centers[Math.floor(Math.random() * centers.length)];
    const offsets = [-2, -1, 0, 1, 2];
    const nums = offsets.map(o => mean + o);
    const s = Math.sqrt(2.5);
    const cv = Math.round((s / mean) * 10000) / 100;
    return {
      givenData: {
        "產業情境": `${story.industry}（${story.company}）`,
        "樣本數值": `[${nums.join(", ")}]`,
        "樣本數 n": "5"
      },
      questionPrompt: `【${story.industry}品質穩定度】${story.company}抽檢 5 批「${story.processItem}」，觀測數據為：\n\`${nums.join(", ")}\`（單位：${story.processUnit}）。請計算該樣本之「變異係數 CV（%）」（四捨五入至小數後兩位）。`,
      correctAnswer: cv,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解（${story.industry}場景）】\n1. 平均數 $\\bar{X} = ${mean}$。\n2. 離均差平方和 $\\sum (X_i - ${mean})^2 = 4 + 1 + 0 + 1 + 4 = 10$。\n3. 樣本標準差 $S = \\sqrt{10 / 4} = \\sqrt{2.5} \\approx 1.5811$。\n4. 變異係數：\n   $$CV = \\frac{S}{\\bar{X}} \\times 100\\% = \\frac{1.5811}{${mean}} \\times 100\\% \\approx ${cv}\\%$$`
    };
  },

  "q-u1-l3-01": function(q) {
    const story = pickStory();
    const combos = [
      { v0: 5000, t: 3, cagr: 20, vt: 8640 },
      { v0: 2000, t: 3, cagr: 20, vt: 3456 },
      { v0: 4000, t: 2, cagr: 25, vt: 6250 },
      { v0: 3000, t: 2, cagr: 30, vt: 5070 },
      { v0: 1000, t: 3, cagr: 50, vt: 3375 },
      { v0: 6000, t: 2, cagr: 10, vt: 7260 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "產業情境": `${story.industry}（${story.company}）`,
        "基準年營收 V0": `${pick.v0.toLocaleString()} 萬元`,
        "目標 CAGR": `${pick.cagr}%`,
        "目標跨期 t": `${pick.t} 年`
      },
      questionPrompt: `【${story.industry}發展戰略】${story.company}當前（第 0 年）${story.revenueContext}為 ${pick.v0.toLocaleString()} 萬元。董事會設定未來 ${pick.t} 年的目標複合年成長率（CAGR）需達到 ${pick.cagr}%。請問該公司在第 ${pick.t} 年年末必須達成多少營收規模（萬元）？`,
      correctAnswer: pick.vt,
      unitLabel: "萬元",
      tolerance: 1.0,
      fullSolution: `【動態題解（${story.industry}場景）】\n由複合成長率公式：\n$$V_t = V_0 \\times (1 + \\text{CAGR})^t = ${pick.v0} \\times (1 + ${pick.cagr/100})^{${pick.t}} = ${pick.vt}\\text{ 萬元}$$`
    };
  },

  "q-u1-l3-02": function(q) {
    const story = pickStory();
    const base = Math.floor(Math.random() * 12) + 10;
    const steps = [6, 4, 6, 7, 7, 16, 7, 15];
    let nums = [base];
    for (let s of steps) nums.push(nums[nums.length - 1] + s);
    const q1 = nums[2];
    const q3 = nums[6];
    const iqr = q3 - q1;
    return {
      givenData: {
        "產業情境": `${story.industry}（${story.company}）`,
        "已排序數據列 (n=9)": `[${nums.join(", ")}]`,
        "Q1 板書位置 L25%": "3.0",
        "Q3 板書位置 L75%": "7.0"
      },
      questionPrompt: `【${story.industry}離散分佈】${story.company}收集 9 筆「${story.item}」（單位：${story.unit}），排序數據如下：\n\`${nums.join(", ")}\`（$n = 9$）。\n請依課堂板書唯一標準位置公式（$L_{25\\%} = \\frac{25}{100}(n-1)+1$、$L_{75\\%} = \\frac{75}{100}(n-1)+1$）計算其第 1 四分位數 $Q_1$ 與第 3 四分位數 $Q_3$，並求出「四分位距（IQR）」。`,
      correctAnswer: iqr,
      unitLabel: story.unit,
      tolerance: 0.1,
      fullSolution: `【動態題解（${story.industry}場景）】\n1. 板書位置公式：\n   $$L_{25\\%} = \\frac{25}{100}(9 - 1) + 1 = 3.0 \\implies Q_1 = X_3 = ${q1}$$\n   $$L_{75\\%} = \\frac{75}{100}(9 - 1) + 1 = 7.0 \\implies Q_3 = X_7 = ${q3}$$\n2. 四分位距：\n   $$IQR = Q_3 - Q_1 = ${q3} - ${q1} = ${iqr}$$`
    };
  },

  "q-u1-l4-01": function(q) {
    const story = pickStory();
    const sets = [
      { v0: 1000, r: [100, -50, 100, -50], v4: 1000, cagr: 0, arith: 25 },
      { v0: 1000, r: [50, -20, 50, -20], v4: 1440, cagr: 9.54, arith: 15 },
      { v0: 1000, r: [60, -30, 60, -30], v4: 1254.4, cagr: 5.84, arith: 15 },
      { v0: 1000, r: [80, -40, 80, -40], v4: 1166.4, cagr: 3.92, arith: 20 }
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    return {
      givenData: {
        "產業情境": `${story.industry}（${story.company}）`,
        "初期資本 V0": `${pick.v0} 萬元`,
        "第 1 年成長率": `+${pick.r[0]}%`,
        "第 2 年成長率": `${pick.r[1]}%`,
        "第 3 年成長率": `+${pick.r[2]}%`,
        "第 4 年成長率": `${pick.r[3]}%`
      },
      questionPrompt: `【${story.industry}資本擴張】${story.company}成立 4 年，${story.firmGrowth}初期為 ${pick.v0} 萬元。各年成長率依序為：第 1 年 +${pick.r[0]}%、第 2 年 ${pick.r[1]}%、第 3 年 +${pick.r[2]}%、第 4 年 ${pick.r[3]}%。\n請在紙筆上完整手算：\n(1) 4 年後之期末資本額 $V_4$；\n(2) 這 4 年成長率之「算術平均數（Arithmetic Mean）」；\n(3) 這 4 年營運之「幾何平均年成長率（CAGR）」。`,
      fullSolution: `【動態題解（${story.industry}場景）】\n1. 期末資本額：\n   $$V_4 = ${pick.v0} \\times (1 + ${pick.r[0]/100}) \\times (1 + ${pick.r[1]/100}) \\times (1 + ${pick.r[2]/100}) \\times (1 + ${pick.r[3]/100}) = ${pick.v4}\\text{ 萬元}$$\n2. 算術平均成長率：\n   $$\\bar{R}_a = \\frac{${pick.r.join(" + ")}} {4} = ${pick.arith}\\%$$\n3. 幾何平均成長率 (CAGR)：\n   $$\\text{CAGR} = (${pick.v4} / ${pick.v0})^{1/4} - 1 \\approx ${pick.cagr}\\%$$`
    };
  },

  "q-u1-l4-02": function(q) {
    const story = pickStory();
    const bases = [50, 53, 60, 65, 70];
    const mean = bases[Math.floor(Math.random() * bases.length)];
    const offsets = [-5, -3, -1, 1, 3, 5];
    const nums = offsets.map(o => mean + o);
    const s2 = 14.0;
    const s = Math.round(Math.sqrt(14) * 100) / 100;
    const cv = Math.round((Math.sqrt(14) / mean) * 10000) / 100;
    const displayUnit = story.processUnit === "%" ? "%" : story.processUnit;
    return {
      givenData: {
        "產業情境": `${story.industry}（${story.company}）`,
        "檢測樣本數值": `[${nums.join(", ")}]`,
        "樣本數 n": "6"
      },
      questionPrompt: `【${story.industry}製程精度】${story.company}檢驗 6 件產品之「${story.processItem}」（單位：${story.processUnit}，已由小至大排序）：\n\`[${nums.join(", ")}]\`（$n = 6$）。品管經理欲評估該製程的離散程度。\n請依序手算：\n(1) 樣本平均數 $\\bar{X}$；\n(2) 離均差平方和 $\\sum (X_i - \\bar{X})^2$；\n(3) 樣本變異數 $S^2$（不偏估計量，自由度 $n-1$）；\n(4) 樣本標準差 $S$；\n(5) 變異係數 $CV$（%）。\n請在作答框填入「樣本變異數 $S^2$」的數值。`,
      correctAnswer: s2,
      unitLabel: `${displayUnit}²`,
      tolerance: 0.1,
      fullSolution: `【動態題解（${story.industry}場景）】\n1. 平均數 $\\bar{X} = \\frac{\\sum X_i}{6} = ${mean}.0$ ${displayUnit}。\n2. 離均差平方和 $\\sum(X_i - \\bar{X})^2 = 25 + 9 + 1 + 1 + 9 + 25 = 70$。\n3. 樣本變異數 $$S^2 = \\frac{70}{6 - 1} = \\frac{70}{5} = ${s2}$$。\n4. 樣本標準差 $$S = \\sqrt{14} \\approx ${s}$$。\n5. 變異係數 $$CV = \\frac{S}{\\bar{X}} \\times 100\\% \\approx ${cv}\\%$$。`
    };
  },

  // ==========================================
  // 單元二：距離與相似度度量
  // ==========================================
  "q-u2-l2-01": function(q) {
    const a = Math.floor(Math.random() * 4) + 4;
    const b = Math.floor(Math.random() * 2) + 1;
    const c = Math.floor(Math.random() * 2) + 1;
    const d = Math.floor(Math.random() * 2) + 2;
    const N = a + b + c + d;
    const smc = Math.round(((a + d) / N) * 100) / 100;
    return {
      givenData: {
        "雙0次數 a": `${a}`,
        "甲0乙1次數 b": `${b}`,
        "甲1乙0次數 c": `${c}`,
        "雙1次數 d": `${d}`,
        "總項目數 N": `${N}`
      },
      questionPrompt: `比對兩名消費者的二元購買紀錄，統計列聯表如下：雙 0 項目 $a = ${a}$、甲 0 乙 1 項目 $b = ${b}$、甲 1 乙 0 項目 $c = ${c}$、雙 1 項目 $d = ${d}$（總數 $N = ${N}$）。請計算兩人之簡單匹配係數 SMC。`,
      correctAnswer: smc,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\n$$SMC = \\frac{a + d}{N} = \\frac{${a} + ${d}}{${N}} = \\frac{${a+d}}{${N}} = ${smc}$$`
    };
  },

  "q-u2-l2-02": function(q) {
    const a = Math.floor(Math.random() * 4) + 4;
    const b = Math.floor(Math.random() * 2) + 1;
    const c = Math.floor(Math.random() * 2) + 1;
    const d = Math.floor(Math.random() * 2) + 2;
    const den = b + c + d;
    const jaccard = Math.round((d / den) * 100) / 100;
    return {
      givenData: {
        "雙0次數 a": `${a}`,
        "甲0乙1次數 b": `${b}`,
        "甲1乙0次數 c": `${c}`,
        "雙1次數 d": `${d}`
      },
      questionPrompt: `比對兩位消費者的商品購買紀錄，統計列聯表如下：雙 0 數 $a = ${a}$、甲 0 乙 1 數 $b = ${b}$、甲 1 乙 0 數 $c = ${c}$、雙 1 數 $d = ${d}$。請計算兩人之雅卡爾指數（Jaccard Index）。`,
      correctAnswer: jaccard,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\nJaccard 排除雙 0 負匹配 $a$：\n$$Jaccard = \\frac{d}{b + c + d} = \\frac{${d}}{${b} + ${c} + ${d}} = \\frac{${d}}{${den}} \\approx ${jaccard}$$`
    };
  },

  "q-u2-l2-03": function(q) {
    const variations = [
      { d: 3, c: 2, b: 1, a: 4, ans: 0.50,
        vecA: "[1, 1, 1, 1, 1, 0, 0, 0, 0, 0]",
        vecB: "[1, 1, 1, 0, 0, 1, 0, 0, 0, 0]" },
      { d: 2, c: 2, b: 1, a: 5, ans: 0.40,
        vecA: "[1, 1, 1, 1, 0, 0, 0, 0, 0, 0]",
        vecB: "[1, 1, 0, 0, 1, 0, 0, 0, 0, 0]" },
      { d: 4, c: 2, b: 2, a: 2, ans: 0.50,
        vecA: "[1, 1, 1, 1, 1, 1, 0, 0, 0, 0]",
        vecB: "[1, 1, 1, 1, 0, 0, 1, 1, 0, 0]" },
      { d: 3, c: 1, b: 1, a: 5, ans: 0.60,
        vecA: "[1, 1, 1, 1, 0, 0, 0, 0, 0, 0]",
        vecB: "[1, 1, 1, 0, 1, 0, 0, 0, 0, 0]" },
      { d: 2, c: 3, b: 3, a: 2, ans: 0.25,
        vecA: "[1, 1, 1, 1, 1, 0, 0, 0, 0, 0]",
        vecB: "[1, 1, 0, 0, 0, 1, 1, 1, 0, 0]" },
      { d: 1, c: 1, b: 2, a: 6, ans: 0.25,
        vecA: "[1, 1, 0, 0, 0, 0, 0, 0, 0, 0]",
        vecB: "[1, 0, 1, 1, 0, 0, 0, 0, 0, 0]" }
    ];
    const pick = variations[Math.floor(Math.random() * variations.length)];
    const denom = pick.b + pick.c + pick.d;
    return {
      givenData: {
        "總商品品項數 N": "10",
        "顧客甲購買向量": pick.vecA,
        "顧客乙購買向量": pick.vecB
      },
      questionPrompt: `某電商平台分析甲、乙兩位顧客在 10 項代表性商品類別中的購買紀錄（1 表有購買，0 表未購買）：\n- 顧客甲：\`${pick.vecA}\`\n- 顧客乙：\`${pick.vecB}\`\n請根據二元關聯列聯表規則，統計兩人之 $a, b, c, d$ 次數，並計算甲與乙之間的「雅卡爾指數（Jaccard Index）」。（四捨五入至小數點後兩位）`,
      correctAnswer: pick.ans,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\n1. 逐項比對計數：\n   - 雙 1 共同購買 $d = ${pick.d}$\n   - 甲 1 乙 0 購買 $c = ${pick.c}$\n   - 甲 0 乙 1 購買 $b = ${pick.b}$\n   - 雙 0 皆未買 $a = ${pick.a}$\n2. 套用板書 Jaccard 公式：\n   $$Jaccard = \\frac{d}{b + c + d} = \\frac{${pick.d}}{${pick.b} + ${pick.c} + ${pick.d}} = \\frac{${pick.d}}{${denom}} = ${pick.ans}$$`
    };
  },

  "q-u2-l3-01": function(q) {
    const scales = [50, 100, 200];
    const s = scales[Math.floor(Math.random() * scales.length)];
    const a = Math.round(s * 0.92);
    const d = Math.round(s * 0.04);
    const bc = s - a - d;
    return {
      givenData: {
        "雙0無缺陷項目 a": `${a}`,
        "單邊檢出缺陷 b + c": `${bc}`,
        "雙1共同缺陷 d": `${d}`,
        "總檢驗項目 N": `${s}`
      },
      questionPrompt: `某晶圓代工廠品管部門對兩批出廠晶圓抽檢 ${s} 項嚴格的物理缺陷特徵（1 表存在缺陷，0 表無缺陷/合格）。檢驗結果顯示：兩批晶圓在 ${a} 項缺陷特徵上皆未檢出（雙 0），在 ${d} 項特徵上皆檢出相同缺陷（雙 1），另有 ${bc} 項為單邊檢出。若欲衡量兩批產品在「品質規格一致性」上的契合度，為何此時選用 SMC 比 Jaccard 更具管理合理性？`,
      fullSolution: `【動態題解】\n1. 在品質品管情境中，『雙 0 代表兩批產品都完美無缺陷、同時合格通過』，這是品質高度一致的關鍵實質成就，絕非無意義的空白！\n2. SMC 分子包含 a（雙方皆合格），本題 $SMC = \\frac{${a} + ${d}}{${s}} = ${(a+d)/s}$，真實反映兩批產品的超高良率吻合度。\n3. 若盲目套用 Jaccard 剔除 a，指標將縮水為 $\\frac{${d}}{${bc} + ${d}} = ${(d/(bc+d)).toFixed(2)}$，嚴重低估其一致性品質。`
    };
  },

  "q-u2-l3-02": function(q) {
    const combos = [
      { N: 20, d: 3, c: 2, b: 1, a: 14, smc: 0.85, j: 0.50, diff: 0.35 },
      { N: 20, d: 2, c: 1, b: 1, a: 16, smc: 0.90, j: 0.50, diff: 0.40 },
      { N: 25, d: 4, c: 3, b: 1, a: 17, smc: 0.84, j: 0.50, diff: 0.34 },
      { N: 20, d: 3, c: 1, b: 1, a: 15, smc: 0.90, j: 0.60, diff: 0.30 },
      { N: 20, d: 2, c: 2, b: 1, a: 15, smc: 0.85, j: 0.40, diff: 0.45 },
      { N: 25, d: 3, c: 2, b: 1, a: 19, smc: 0.88, j: 0.50, diff: 0.38 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    const jDenom = pick.b + pick.c + pick.d;
    return {
      givenData: {
        "總商品數 N": `${pick.N}`,
        "雙1共同購買數 d": `${pick.d}`,
        "甲買乙未買數 c": `${pick.c}`,
        "乙買甲未買數 b": `${pick.b}`,
        "雙0皆未買數 a": `${pick.a}`
      },
      questionPrompt: `某生鮮量販店分析兩位會員在 ${pick.N} 項特定檔期商品中的二元購買行為。統計結果顯示：\n- 兩人皆購買之品項數 $d = ${pick.d}$\n- 甲購買但乙未購買之品項數 $c = ${pick.c}$\n- 乙購買但甲未購買之品項數 $b = ${pick.b}$\n- 兩人皆未購買之品項數 $a = ${pick.a}$\n請分別計算兩位會員的簡單匹配係數（SMC）與雅卡爾指數（Jaccard），並計算**因計入雙 0 負匹配項目導致 SMC 比 Jaccard 虛高膨脹了多少**（即求差額 $SMC - Jaccard$）。（四捨五入至小數點後兩位）`,
      correctAnswer: pick.diff,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\n1. 計算 SMC（含雙 0）：\n   $$SMC = \\frac{a + d}{N} = \\frac{${pick.a} + ${pick.d}}{${pick.N}} = \\frac{${pick.a + pick.d}}{${pick.N}} = ${pick.smc}$$\n2. 計算 Jaccard（排除雙 0）：\n   $$Jaccard = \\frac{d}{b + c + d} = \\frac{${pick.d}}{${jDenom}} = ${pick.j}$$\n3. 虛高灌水差額：\n   $$\\Delta = SMC - Jaccard = ${pick.smc} - ${pick.j} = ${pick.diff}$$`
    };
  },

  "q-u2-l4-01": function(q) {
    const a_vals = [500, 1000, 2000];
    const a_new = a_vals[Math.floor(Math.random() * a_vals.length)];
    const d = 3, c = 2, b = 1;
    const N_new = a_new + b + c + d;
    const smc = Math.round(((a_new + d) / N_new) * 10000) / 10000;
    return {
      givenData: {
        "共同看過 d": `${d}`,
        "甲看乙未看 c": `${c}`,
        "乙看甲未看 b": `${b}`,
        "全片庫共同未看 a": `${a_new}`
      },
      questionPrompt: `某影音串流平台比對兩位影迷觀看紀錄：共同看過 $d = ${d}$ 部，甲看乙未看 $c = ${c}$ 部，乙看甲未看 $b = ${b}$ 部。當納入全片庫中兩人皆未看過的 ${a_new} 部冷門電影（$a = ${a_new}$）後，請計算兩人全片庫之 SMC 簡單匹配係數（請四捨五入至小數點後四位）。`,
      correctAnswer: smc,
      unitLabel: "",
      tolerance: 0.005,
      fullSolution: `【動態題解】\n全片庫總數 $$N = ${a_new} + 1 + 2 + 3 = ${N_new}$$\n$$SMC = \\frac{${a_new} + ${d}}{${N_new}} = \\frac{${a_new + d}}{${N_new}} \\approx ${smc}$$\n（說明：因巨量雙 0 稀釋，SMC 虛高至 0.99 以上，失去鑑別度！）`
    };
  },

  // ==========================================
  // 單元三：機率論、全機率與貝氏定理
  // ==========================================
  "q-u3-l2-01": function(q) {
    const pD = 0.20, pG = 0.80;
    const sensOptions = [0.90, 0.95, 0.85];
    const specFalseOptions = [0.05, 0.04, 0.08];
    const pT_D = sensOptions[Math.floor(Math.random() * sensOptions.length)];
    const pT_G = specFalseOptions[Math.floor(Math.random() * specFalseOptions.length)];
    const num = pT_D * pD;
    const den = num + pT_G * pG;
    const ans = Math.round((num / den) * 10000) / 100;
    return {
      givenData: {
        "不良品率 P(D)": `${pD}`,
        "良品率 P(G)": `${pG}`,
        "不良品警報率 P(T+|D)": `${pT_D}`,
        "良品誤報率 P(T+|G)": `${pT_G}`
      },
      questionPrompt: `某檢驗系統對晶片進行檢測，不良品率為 $P(D) = ${pD}$、良品率為 $P(G) = ${pG}$。當為不良品時觸發警報機率為 $${pT_D}$，良品時誤報機率為 $${pT_G}$。若某晶片觸發了警報，求其真正為不良品的後驗機率（%）。`,
      correctAnswer: ans,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n1. 全機率：\n   $$P(T^+) = (${pT_D} \\times ${pD}) + (${pT_G} \\times ${pG}) = ${num.toFixed(3)} + ${(pT_G*pG).toFixed(3)} = ${den.toFixed(3)}$$\n2. 後驗機率：\n   $$P(D|T^+) = \\frac{${num.toFixed(3)}}{${den.toFixed(3)}} \\approx ${ans}\\%$$`
    };
  },

  "q-u3-l2-02": function(q) {
    const sets = [
      { pA: 0.35, pB: 0.25, pAB: 0.10, ans: 0.50 },
      { pA: 0.40, pB: 0.30, pAB: 0.15, ans: 0.55 },
      { pA: 0.50, pB: 0.20, pAB: 0.10, ans: 0.60 },
      { pA: 0.45, pB: 0.35, pAB: 0.20, ans: 0.60 },
      { pA: 0.30, pB: 0.40, pAB: 0.12, ans: 0.58 }
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    return {
      givenData: {
        "連線異常機率 P(A)": `${pick.pA}`,
        "資料庫逾時機率 P(B)": `${pick.pB}`,
        "同時發生機率 P(A∩B)": `${pick.pAB}`
      },
      questionPrompt: `伺服器運行日誌統計顯示：網路連線異常機率為 $P(A) = ${pick.pA}$，資料庫讀寫逾時機率為 $P(B) = ${pick.pB}$，兩者同時發生機率為 $P(A \\cap B) = ${pick.pAB}$。請問伺服器出現「至少一種異常」的聯集機率 $P(A \\cup B)$ 為何？`,
      correctAnswer: pick.ans,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\n由加法定律：\n$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${pick.pA} + ${pick.pB} - ${pick.pAB} = ${pick.ans}$$`
    };
  },

  "q-u3-l2-03": function(q) {
    const combos = [
      { n: 100, p: 0.20, ans: 20.0 },
      { n: 200, p: 0.15, ans: 30.0 },
      { n: 150, p: 0.20, ans: 30.0 },
      { n: 250, p: 0.20, ans: 50.0 },
      { n: 400, p: 0.25, ans: 100.0 },
      { n: 50, p: 0.40, ans: 20.0 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "抽樣樣本數 n": `${pick.n}`,
        "成功轉換率 p": `${pick.p}`
      },
      questionPrompt: `某電商廣告轉換率為 $p = ${pick.p}$。業務部隨機抽樣 $n = ${pick.n}$ 名點擊廣告訪客，令隨機變數 $X$ 代表最終下單購買人數。請計算 $X$ 的期望值 $E(X)$。`,
      correctAnswer: pick.ans,
      unitLabel: "人",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n二項分配期望值公式：$$E(X) = n \\cdot p = ${pick.n} \\times ${pick.p} = ${pick.ans}\\text{ 人}$$`
    };
  },

  "q-u3-l3-01": function(q) {
    const combos = [
      { pA: 0.60, dA: 0.02, pB: 0.40, dB: 0.05, num: 0.020, den: 0.032, ans: 62.5 },
      { pA: 0.70, dA: 0.02, pB: 0.30, dB: 0.06, num: 0.018, den: 0.032, ans: 56.25 },
      { pA: 0.50, dA: 0.02, pB: 0.50, dB: 0.06, num: 0.030, den: 0.040, ans: 75.0 },
      { pA: 0.60, dA: 0.01, pB: 0.40, dB: 0.04, num: 0.016, den: 0.022, ans: 72.73 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "產線 A 產量佔比": `${Math.round(pick.pA * 100)}%`,
        "產線 A 不良率": `${Math.round(pick.dA * 100)}%`,
        "產線 B 產量佔比": `${Math.round(pick.pB * 100)}%`,
        "產線 B 不良率": `${Math.round(pick.dB * 100)}%`
      },
      questionPrompt: `某工廠由產線 A 與產線 B 生產零件。產線 A 佔全廠產量 ${Math.round(pick.pA*100)}%，不良率為 ${Math.round(pick.dA*100)}%；產線 B 佔全廠產量 ${Math.round(pick.pB*100)}%，不良率為 ${Math.round(pick.dB*100)}%。若品管抽得 1 件不良品，請問該不良品來自產線 B 的後驗機率為多少 %？`,
      correctAnswer: pick.ans,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n1. 全機率分母：\n   $$P(D) = (${pick.pA} \\times ${pick.dA}) + (${pick.pB} \\times ${pick.dB}) = ${pick.den}$$\n2. 分子：\n   $$P(B \\cap D) = ${pick.pB} \\times ${pick.dB} = ${pick.num}$$\n3. 後驗機率：\n   $$P(B|D) = \\frac{${pick.num}}{${pick.den}} = ${pick.ans}\\%$$`
    };
  },

  "q-u3-l3-02": function(q) {
    const combos = [
      { pA: 0.50, dA: 0.01, pB: 0.30, dB: 0.02, pC: 0.20, dC: 0.03, ans: 35.29 },
      { pA: 0.40, dA: 0.01, pB: 0.40, dB: 0.02, pC: 0.20, dC: 0.04, ans: 40.00 },
      { pA: 0.50, dA: 0.02, pB: 0.30, dB: 0.03, pC: 0.20, dC: 0.05, ans: 31.03 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    const den = pick.pA * pick.dA + pick.pB * pick.dB + pick.pC * pick.dC;
    const num = pick.pB * pick.dB;
    return {
      givenData: {
        "產線佔比 (A, B, C)": `(${pick.pA*100}%, ${pick.pB*100}%, ${pick.pC*100}%)`,
        "各線不良率 (A, B, C)": `(${pick.dA*100}%, ${pick.dB*100}%, ${pick.dC*100}%)`
      },
      questionPrompt: `某電子廠有 A、B、C 三條生產線，產量佔比分別為 ${pick.pA*100}%、${pick.pB*100}%、${pick.pC*100}%。已知不良品率分別為 ${pick.dA*100}%、${pick.dB*100}%、${pick.dC*100}%。若抽得一件瑕疵品，求其來自產線 B 的後驗機率（%）。`,
      correctAnswer: pick.ans,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n1. 全機率：\n   $$P(D) = (${pick.pA}\\times${pick.dA}) + (${pick.pB}\\times${pick.dB}) + (${pick.pC}\\times${pick.dC}) = ${den.toFixed(4)}$$\n2. 分子：\n   $$P(B \\cap D) = ${num.toFixed(4)}$$\n3. 後驗：\n   $$P(B|D) = \\frac{${num.toFixed(4)}}{${den.toFixed(4)}} \\approx ${pick.ans}\\%$$`
    };
  },

  "q-u3-l4-01": function(q) {
    const combos = [
      { pF: 0.001, sens: 0.95, fa: 0.01, ans: 8.68 },
      { pF: 0.002, sens: 0.90, fa: 0.01, ans: 15.28 },
      { pF: 0.001, sens: 0.98, fa: 0.01, ans: 8.93 },
      { pF: 0.005, sens: 0.95, fa: 0.02, ans: 19.27 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    const pNF = 1 - pick.pF;
    const num = pick.sens * pick.pF;
    const den = num + pick.fa * pNF;
    return {
      givenData: {
        "真實詐欺率 P(F)": `${(pick.pF * 100).toFixed(2)}%`,
        "警報敏感度 P(Alarm|F)": `${(pick.sens * 100).toFixed(1)}%`,
        "正常交易誤報率 P(Alarm|NF)": `${(pick.fa * 100).toFixed(1)}%`
      },
      questionPrompt: `某數位銀行建立 AI 盜刷防偽系統。已知信用卡真實盜刷率僅 ${(pick.pF*100).toFixed(2)}%。當為盜刷時系統警報機率為 ${(pick.sens*100).toFixed(1)}%，正常交易時誤報率為 ${(pick.fa*100).toFixed(1)}%。若系統觸發盜刷警報，求該筆交易真正為盜刷的後驗機率（%）。`,
      correctAnswer: pick.ans,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n1. 分子（真盜刷警報）：\n   $$${pick.sens} \\times ${pick.pF} = ${num.toFixed(5)}$$\n2. 分母（總警報機率）：\n   $$${num.toFixed(5)} + (${pick.fa} \\times ${pNF.toFixed(3)}) = ${den.toFixed(5)}$$\n3. 後驗機率：\n   $$P(F|\\text{Alarm}) = \\frac{${num.toFixed(5)}}{${den.toFixed(5)}} \\approx ${pick.ans}\\%$$`
    };
  },

  "q-u3-l4-02": function(q) {
    const sets = [
      { pAS: 0.70, pAF: 0.30, pBS_AS: 0.90, pBF_AF: 0.85, pBS: 0.675, pAS_BS: "93.33%", pAS_BF: "21.54%" },
      { pAS: 0.60, pAF: 0.40, pBS_AS: 0.90, pBF_AF: 0.80, pBS: 0.620, pAS_BS: "87.10%", pAS_BF: "15.79%" },
      { pAS: 0.80, pAF: 0.20, pBS_AS: 0.90, pBF_AF: 0.85, pBS: 0.750, pAS_BS: "96.00%", pAS_BF: "32.00%" }
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    return {
      givenData: {
        "全面開店先驗機率": `P(AS) = ${pick.pAS}, P(AF) = ${pick.pAF}`,
        "分店試驗條件精度": `P(BS|AS) = ${pick.pBS_AS}, P(BF|AF) = ${pick.pBF_AF}`
      },
      questionPrompt: `【企3B 作業 EX1 & EX2 動態題】某連鎖手搖飲品牌評估展店：全面開店成功先驗機率 $P(AS) = ${pick.pAS}$，失敗 $P(AF) = ${pick.pAF}$。先行開設分店試驗的精度為：$P(BS|AS) = ${pick.pBS_AS}$，$P(BF|AF) = ${pick.pBF_AF}$。\n請在紙筆上完整手算：\n(1) 分店試驗成功的全機率 $P(BS)$；\n(2) 當分店成功時全面開店成功之條件機率 $P(AS|BS)$；\n(3) 當分店失敗時全面開店成功之條件機率 $P(AS|BF)$。`,
      fullSolution: `【動態題解】\n1. 全機率定理：\n   $$P(BS) = (${pick.pBS_AS} \\times ${pick.pAS}) + (${(1-pick.pBF_AF).toFixed(2)} \\times ${pick.pAF}) = ${pick.pBS}$$\n2. 後驗機率：\n   $$P(AS|BS) = \\frac{${pick.pBS_AS} \\times ${pick.pAS}}{${pick.pBS}} \\approx ${pick.pAS_BS}$$\n   $$P(AS|BF) = \\frac{${(1-pick.pBS_AS).toFixed(2)} \\times ${pick.pAS}}{${(1-pick.pBS).toFixed(3)}} \\approx ${pick.pAS_BF}$$`
    };
  },

  // ==========================================
  // 單元四：迴歸分析與交互作用
  // ==========================================
  "q-u4-l2-01": function(q) {
    const combos = [
      { sst: 500, sse: 125, ssr: 375, r2: 0.75 },
      { sst: 800, sse: 160, ssr: 640, r2: 0.80 },
      { sst: 1000, sse: 150, ssr: 850, r2: 0.85 },
      { sst: 400, sse: 80, ssr: 320, r2: 0.80 },
      { sst: 600, sse: 180, ssr: 420, r2: 0.70 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "總平方和 SST": `${pick.sst}`,
        "殘差平方和 SSE": `${pick.sse}`
      },
      questionPrompt: `某計量模型評估研發投資對專利產出的解釋力。統計顯示依變數的總變異平方和為 $SST = ${pick.sst}$，殘差平方和為 $SSE = ${pick.sse}$。請計算該模型之「判定係數 $R^2$」（四捨五入至小數後兩位）。`,
      correctAnswer: pick.r2,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\n$$SSR = SST - SSE = ${pick.sst} - ${pick.sse} = ${pick.ssr}$$\n$$R^2 = \\frac{SSR}{SST} = 1 - \\frac{SSE}{SST} = 1 - \\frac{${pick.sse}}{${pick.sst}} = ${pick.r2}$$`
    };
  },

  "q-u4-l2-02": function(q) {
    const combos = [
      { ssxy: 120, ssxx: 40, xbar: 10, ybar: 50, b1: 3.0, b0: 20.0 },
      { ssxy: 150, ssxx: 50, xbar: 12, ybar: 60, b1: 3.0, b0: 24.0 },
      { ssxy: 80, ssxx: 40, xbar: 15, ybar: 45, b1: 2.0, b0: 15.0 },
      { ssxy: 200, ssxx: 50, xbar: 8, ybar: 50, b1: 4.0, b0: 18.0 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "SSxy": `${pick.ssxy}`,
        "SSxx": `${pick.ssxx}`,
        "X̄ (廣告支出平均)": `${pick.xbar}`,
        "Ȳ (營收平均)": `${pick.ybar}`
      },
      questionPrompt: `某連鎖餐飲建立廣告支出 $X$ 對營收 $Y$ 的迴歸模型：$SS_{xy} = ${pick.ssxy}$，$SS_{xx} = ${pick.ssxx}$，廣告平均 $\\bar{X} = ${pick.xbar}$ 萬元，營收平均 $\\bar{Y} = ${pick.ybar}$ 萬元。請計算該迴歸直線的「截距項 $b_0$」（萬元）。`,
      correctAnswer: pick.b0,
      unitLabel: "萬元",
      tolerance: 0.05,
      fullSolution: `【動態題解】\n1. 斜率：\n   $$b_1 = \\frac{SS_{xy}}{SS_{xx}} = \\frac{${pick.ssxy}}{${pick.ssxx}} = ${pick.b1}$$\n2. 截距：\n   $$b_0 = \\bar{Y} - b_1 \\bar{X} = ${pick.ybar} - (${pick.b1} \\times ${pick.xbar}) = ${pick.b0}\\text{ 萬元}$$`
    };
  },

  "q-u4-l2-03": function(q) {
    const combos = [
      { sst: 500, sse: 125, r2: 0.75, n: 25 },
      { sst: 600, sse: 120, r2: 0.80, n: 30 },
      { sst: 800, sse: 200, r2: 0.75, n: 28 },
      { sst: 1000, sse: 200, r2: 0.80, n: 35 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "總平方和 SST": `${pick.sst}`,
        "殘差平方和 SSE": `${pick.sse}`,
        "樣本數 n": `${pick.n}`
      },
      questionPrompt: `某產品研發迴歸模型樣本數 $n = ${pick.n}$，依變數總變異平方和 $SST = ${pick.sst}$，殘差平方和 $SSE = ${pick.sse}$。請計算判定係數 $R^2$。`,
      correctAnswer: pick.r2,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\n$$R^2 = 1 - \\frac{SSE}{SST} = 1 - \\frac{${pick.sse}}{${pick.sst}} = ${pick.r2}$$`
    };
  },

  "q-u4-l3-01": function(q) {
    const combos = [
      { b1: 4, b3: 1.5, x2: 4, ans: 10.0 },
      { b1: 5, b3: 2.0, x2: 3, ans: 11.0 },
      { b1: 3, b3: 1.2, x2: 5, ans: 9.0 },
      { b1: 6, b3: 2.5, x2: 2, ans: 11.0 },
      { b1: 4, b3: 1.8, x2: 5, ans: 13.0 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "迴歸方程式": `Ŷ = 10 + ${pick.b1}*X1 + 6*X2 + ${pick.b3}*(X1*X2)`,
        "指定會員等級 X2": `${pick.x2}`
      },
      questionPrompt: `某平台營收預測模型：$\\hat{Y} = 10 + ${pick.b1} X_1 + 6 X_2 + ${pick.b3} (X_1 \\cdot X_2)$，其中 $X_1$ 為折價券面額，$X_2$ 為會員等級。若目標客群會員等級為 $X_2 = ${pick.x2}$，請問 $X_1$ 每增加 1 單位對營收的邊際增加效果（邊際斜率 $\\frac{\\Delta \\hat{Y}}{\\Delta X_1}$）為何？`,
      correctAnswer: pick.ans,
      unitLabel: "萬元",
      tolerance: 0.05,
      fullSolution: `【動態題解】\n邊際斜率求導：\n$$\\frac{\\partial \\hat{Y}}{\\partial X_1} = b_1 + b_3 X_2 = ${pick.b1} + ${pick.b3}(${pick.x2}) = ${pick.ans}\\text{ 萬元}$$`
    };
  },

  "q-u4-l3-02": function(q) {
    const noiseList = [3, 4, 5];
    const noise = noiseList[Math.floor(Math.random() * noiseList.length)];
    return {
      questionPrompt: `某計量分析師在原有包含 2 個有效自變數（$R^2 = 0.65$）的模型中，硬是額外加入 ${noise} 個與依變數毫無關聯的雜訊變數。下列有關自由度、殘差平方和與 $R^2_{adj}$ 的統計變化，何者完全符合學理？`,
      fullSolution: `【動態題解】\n1. 每多加入 1 個雜訊變數，殘差自由度 $n - k - 1$ 便消耗 1（此處消耗 ${noise} 個自由度）。\n2. 雜訊變數無法顯著降低 $SSE$，使得均方誤差 $MSE = SSE / (n-k-1)$ 不降反升。\n3. 自由度懲罰效應壓過微不足道的殘差縮減，導致調整後判定係數 $R^2_{adj}$ 明顯下滑！`
    };
  },

  "q-u4-l4-01": function(q) {
    const combos = [
      { n: 34, k: 3, sst: 800, sse: 200, ans: 0.73 },
      { n: 25, k: 2, sst: 1000, sse: 200, ans: 0.78 },
      { n: 31, k: 3, sst: 600, sse: 120, ans: 0.78 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    const df_e = pick.n - pick.k - 1;
    const df_t = pick.n - 1;
    const mse = pick.sse / df_e;
    const mst = pick.sst / df_t;
    return {
      givenData: {
        "自變數個數 k": `${pick.k}`,
        "樣本數 n": `${pick.n}`,
        "總平方和 SST": `${pick.sst}`,
        "殘差平方和 SSE": `${pick.sse}`
      },
      questionPrompt: `某顧問公司建立多元迴歸模型（自變數個數 $k = ${pick.k}$，樣本數 $n = ${pick.n}$）。已知 $SST = ${pick.sst}$，$SSE = ${pick.sse}$。請計算調整後判定係數 $R^2_{adj}$（四捨五入至小數點後兩位）。`,
      correctAnswer: pick.ans,
      unitLabel: "",
      tolerance: 0.02,
      fullSolution: `【動態題解】\n$$R^2_{adj} = 1 - \\left[ \\frac{SSE / (n - k - 1)}{SST / (n - 1)} \\right] = 1 - \\left[ \\frac{${pick.sse} / ${df_e}}{${pick.sst} / ${df_t}} \\right] = 1 - \\left[ \\frac{${mse.toFixed(4)}}{${mst.toFixed(4)}} \\right] \\approx ${pick.ans}$$`
    };
  },

  // ==========================================
  // 單元五：線性規劃與敏感度分析
  // ==========================================
  "q-u5-l2-01": function(q) {
    const combos = [
      { c1: 3, c2: 5, ans: 38 },
      { c1: 4, c2: 4, ans: 40 },
      { c1: 5, c2: 3, ans: 42 },
      { c1: 4, c2: 5, ans: 44 },
      { c1: 2, c2: 3, ans: 24 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "目標函數": `Max Z = ${pick.c1}*x1 + ${pick.c2}*x2`,
        "限制條件": "2*x1 + x2 <= 16; x1 + 2*x2 <= 14"
      },
      questionPrompt: `考慮線性規劃：$\\text{極大化 } Z = ${pick.c1} x_1 + ${pick.c2} x_2$，受限於 $2 x_1 + x_2 \\le 16$ 與 $x_1 + 2 x_2 \\le 14$（$x_1, x_2 \\ge 0$）。圖解法已求得最佳頂點出現在兩限制線交點 $(6, 4)$。請計算該頂點之最大總利潤 $Z$。`,
      correctAnswer: pick.ans,
      unitLabel: "萬元",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n代入最佳頂點 $(6, 4)$：\n$$Z^* = ${pick.c1}(6) + ${pick.c2}(4) = ${pick.c1*6} + ${pick.c2*4} = ${pick.ans}\\text{ 萬元}$$`
    };
  },

  "q-u5-l2-02": function(q) {
    const points = [
      { x1: 10, x2: 6, ans: 10.0 },
      { x1: 12, x2: 5, ans: 13.0 },
      { x1: 8, x2: 8, ans: 12.0 },
      { x1: 11, x2: 6, ans: 14.0 },
      { x1: 9, x2: 7, ans: 11.0 }
    ];
    const pick = points[Math.floor(Math.random() * points.length)];
    const lhs = 4 * pick.x1 + 5 * pick.x2;
    return {
      givenData: {
        "限制條件": "4*x1 + 5*x2 >= 60",
        "目前解 (x1, x2)": `(${pick.x1}, ${pick.x2})`
      },
      questionPrompt: `蛋白質最低攝取量限制式：$$4 x_1 + 5 x_2 \\ge 60$$\n目前調配使用 $x_1 = ${pick.x1}$ 單位、$x_2 = ${pick.x2}$ 單位。請計算該限制條件在目前方案下的「超額變數（Surplus Variable $E_1$）」數值。`,
      correctAnswer: pick.ans,
      unitLabel: "單位",
      tolerance: 0.05,
      fullSolution: `【動態題解】\n超額變數：\n$$E_1 = 4(${pick.x1}) + 5(${pick.x2}) - 60 = ${lhs} - 60 = ${pick.ans}\\text{ 單位}$$`
    };
  },

  "q-u5-l3-01": function(q) {
    const combos = [
      { c1: 3, c2: 4, ans: 17 },
      { c1: 4, c2: 5, ans: 22 },
      { c1: 5, c2: 6, ans: 27 },
      { c1: 7, c2: 9, ans: 39 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "目標函數": `Min Z = ${pick.c1}*X1 + ${pick.c2}*X2`,
        "限制式": "2*X1 + 3*X2 >= 12; X1 + X2 >= 5"
      },
      questionPrompt: `無人車搬運成本極小化：$$\\text{極小化 } Z = ${pick.c1} X_1 + ${pick.c2} X_2$$\n受限於 $2 X_1 + 3 X_2 \\ge 12$ 與 $X_1 + X_2 \\ge 5$（$X_1, X_2 \\ge 0$）。可行解頂點有 $(6, 0)$、$(3, 2)$、$(0, 5)$。請計算達成最低總成本之最佳解 $Z$ 數值。`,
      correctAnswer: pick.ans,
      unitLabel: "萬元",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n各頂點成本比較：\n- $(6, 0): ${pick.c1}(6) + 0 = ${pick.c1*6}$\n- $(3, 2): ${pick.c1}(3) + ${pick.c2}(2) = ${pick.ans}$\n- $(0, 5): 0 + ${pick.c2}(5) = ${pick.c2*5}$\n故最低成本為 ${pick.ans} 萬元（出現在頂點 $(3, 2)$）。`
    };
  },

  "q-u5-l3-02": function(q) {
    const c2_list = [4, 5, 6, 8, 10];
    const c2 = c2_list[Math.floor(Math.random() * c2_list.length)];
    const lower = c2 / 2;
    const upper = c2 * 2;
    return {
      givenData: {
        "目標函數": `Max Z = c1*x1 + ${c2}*x2`,
        "邊界斜率": "m1 = -1/2, m2 = -2"
      },
      questionPrompt: `承接線性規劃：$\\text{Max } Z = c_1 x_1 + ${c2} x_2$，最佳頂點落在點 $D(6, 4)$，該點由兩條緊縮邊界 $x_1 + 2 x_2 = 14$（斜率 $-1/2$）與 $2 x_1 + x_2 = 16$（斜率 $-2$）相交而成。\n若欲使原最佳頂點維持不變，請在紙筆上完整求出 $c_1$ 的允許變動範圍（Range of Optimality）。`,
      fullSolution: `【動態題解】\n等利潤線斜率夾擠：\n$$-2 \\le -\\frac{c_1}{${c2}} \\le -\\frac{1}{2}$$\n同乘以 $-${c2}$（不等號轉向）：\n$$${upper} \\ge c_1 \\ge ${lower} \\iff ${lower} \\le c_1 \\le ${upper}$$`
    };
  },

  "q-u5-l3-03": function(q) {
    const c2_list = [30, 24, 36, 45, 20];
    const c2 = c2_list[Math.floor(Math.random() * c2_list.length)];
    const upper = c2 * 2;
    return {
      givenData: {
        "目標函數": `Max Z = c1*x1 + ${c2}*x2`,
        "限制線 1 斜率": "-2/3",
        "限制線 2 斜率": "-2"
      },
      questionPrompt: `工廠生產利潤極大化：$\\text{Max } Z = c_1 x_1 + ${c2} x_2$。最佳解落在斜率分別為 $-2/3$ 與 $-2$ 的兩條緊縮限制線交點頂點上。根據斜率夾擠準則（$-2 \\le -\\frac{c_1}{${c2}} \\le -\\frac{2}{3}$），請計算產品 1 單位利潤 $c_1$ 之「容許變動上限」。`,
      correctAnswer: upper,
      unitLabel: "元",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n由 $-2 \\le -\\frac{c_1}{${c2}}$ 同乘 $-${c2}$ 得 $c_1 \\le 2 \\times ${c2} = ${upper}$。\n故 $c_1$ 變動上限為 ${upper} 元。`
    };
  },

  "q-u5-l4-01": function(q) {
    const sets = [
      { A: 12, B: 8, C: 10 },
      { A: 15, B: 10, C: 12 },
      { A: 16, B: 12, C: 8 }
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    return {
      givenData: {
        "各廠區面積上限": `A: ${pick.A}, B: ${pick.B}, C: ${pick.C} 公頃`,
        "公平比例條件": `(xA1+xA2)/${pick.A} = (xB1+xB2)/${pick.B} = (xC1+xC2)/${pick.C}`
      },
      questionPrompt: `【情境描述】科學園區管委會為 A、B、C 三個廠區規劃生產面積，廠房面積分別為 A: ${pick.A}、B: ${pick.B}、C: ${pick.C} 公頃。【公平條款】**三個廠區各自的「總生產面積與其廠房面積」的比例要求完全相等**。\n請在紙筆上完整寫出該公平比例限制式之無分母線性化等式。`,
      fullSolution: `【動態題解】\n連比例式：\n$$\\frac{x_{A1} + x_{A2}}{${pick.A}} = \\frac{x_{B1} + x_{B2}}{${pick.B}} = \\frac{x_{C1} + x_{C2}}{${pick.C}}$$\n交叉相乘線性化：\n1. A 與 B 比：$$${pick.B}(x_{A1} + x_{A2}) - ${pick.A}(x_{B1} + x_{B2}) = 0$$\n2. B 與 C 比：$$${pick.C}(x_{B1} + x_{B2}) - ${pick.B}(x_{C1} + x_{C2}) = 0$$`
    };
  },

  "q-u5-l4-02": function(q) {
    const combos = [
      { shadow: 250, delta: 40, cost: 6000, net: 4000 },
      { shadow: 300, delta: 50, cost: 8000, net: 7000 },
      { shadow: 200, delta: 60, cost: 7000, net: 5000 },
      { shadow: 400, delta: 30, cost: 5000, net: 7000 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    const gross = pick.shadow * pick.delta;
    return {
      givenData: {
        "機時影子價格": `${pick.shadow} 元/小時`,
        "可擴充機時上限": `${pick.delta} 小時`,
        "擴充總固定成本": `${pick.cost.toLocaleString()} 元`
      },
      questionPrompt: `某機械製造商最佳解總利潤為 45,000 元。敏感度報表顯示：組裝機時上限的影子價格為每小時 ${pick.shadow} 元（允許增加量為 80 小時）。現有外包商報價以總成本 ${pick.cost.toLocaleString()} 元提供額外 ${pick.delta} 小時機時。請計算接受此外包擴充方案能為公司帶來的「淨利潤增額」（元）。`,
      correctAnswer: pick.net,
      unitLabel: "元",
      tolerance: 1.0,
      fullSolution: `【動態題解】\n1. 產能擴充帶來之毛利增加：\n   $$${pick.shadow} \\times ${pick.delta} = ${gross}\\text{ 元}$$\n2. 扣除擴充成本：\n   $$${gross} - ${pick.cost} = ${pick.net}\\text{ 元}$$`
    };
  },

  // ==========================================
  // 單元六：不確定情況下之決策準則
  // ==========================================
  "q-u6-l2-01": function(q) {
    const matrices = [
      {
        table: "| 方案 | 繁榮 (S1) | 平平 (S2) | 蕭條 (S3) |\n| 方案 A | 100 | 40 | -20 |\n| 方案 B | 70 | 50 | 10 |\n| 方案 C | 50 | 50 | 40 |",
        mins: { A: -20, B: 10, C: 40 },
        ansKey: "C",
        ansName: "方案 C",
        ansVal: 40
      },
      {
        table: "| 方案 | 繁榮 (S1) | 平平 (S2) | 蕭條 (S3) |\n| 方案 A | 90 | 60 | 35 |\n| 方案 B | 120 | 50 | 10 |\n| 方案 C | 80 | 40 | -10 |",
        mins: { A: 35, B: 10, C: -10 },
        ansKey: "A",
        ansName: "方案 A",
        ansVal: 35
      },
      {
        table: "| 方案 | 繁榮 (S1) | 平平 (S2) | 蕭條 (S3) |\n| 方案 A | 80 | 40 | -5 |\n| 方案 B | 75 | 60 | 30 |\n| 方案 C | 60 | 50 | 25 |",
        mins: { A: -5, B: 30, C: 25 },
        ansKey: "B",
        ansName: "方案 B",
        ansVal: 30
      }
    ];
    const pick = matrices[Math.floor(Math.random() * matrices.length)];
    return {
      givenData: {
        "報酬矩陣": pick.table
      },
      questionPrompt: `給定投資專案在三種景氣下的獲利報酬矩陣如下表：\n\n${pick.table}\n\n若依據「悲觀準則 (Maximin)」，決策者應選擇哪一個方案？`,
      options: [
        { key: "A", text: "方案 A", distractorFeedback: pick.ansKey === "A" ? null : `方案 A 最差獲利為 ${pick.mins.A}` },
        { key: "B", text: "方案 B", distractorFeedback: pick.ansKey === "B" ? null : `方案 B 最差獲利為 ${pick.mins.B}` },
        { key: "C", text: "方案 C", distractorFeedback: pick.ansKey === "C" ? null : `方案 C 最差獲利為 ${pick.mins.C}` },
        { key: "D", text: "方案 A 與 B 均可", distractorFeedback: "非最優方案" }
      ],
      correctAnswer: pick.ansKey,
      fullSolution: `【動態題解】\n1. 各方案在最差景氣下之最低獲利：\n   - A 最差：${pick.mins.A}\n   - B 最差：${pick.mins.B}\n   - C 最差：${pick.mins.C}\n2. 悲觀準則大中取小：最大值為 ${pick.ansVal}，故挑選「${pick.ansName}」。`
    };
  },

  "q-u6-l2-02": function(q) {
    const combos = [
      { vA: [80, 10], vB: [45, 35], max2: 35, ans: 25.0 },
      { vA: [90, 15], vB: [50, 40], max2: 40, ans: 25.0 },
      { vA: [100, 20], vB: [60, 50], max2: 50, ans: 30.0 },
      { vA: [75, 12], vB: [40, 32], max2: 32, ans: 20.0 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "方案 A 獲利 (晴天, 雨天)": `(${pick.vA[0]}, ${pick.vA[1]})`,
        "方案 B 獲利 (晴天, 雨天)": `(${pick.vB[0]}, ${pick.vB[1]})`,
        "實際發生情境": "雨天 (S2)"
      },
      questionPrompt: `超商面對兩種天氣（晴天 S1、雨天 S2）的冰品叫貨獲利：\n- 方案 A（大量叫貨）：晴天獲利 ${pick.vA[0]} 萬，雨天獲利 ${pick.vA[1]} 萬\n- 方案 B（保守叫貨）：晴天獲利 ${pick.vB[0]} 萬，雨天獲利 ${pick.vB[1]} 萬\n若最終為雨天 (S2)，超商若選了方案 A，求雨天情境下之「機會損失（後悔值）」為多少萬元？`,
      correctAnswer: pick.ans,
      unitLabel: "萬元",
      tolerance: 0.05,
      fullSolution: `【動態題解】\n1. 雨天全場最佳獲利：\n   $$\\max(${pick.vA[1]}, ${pick.vB[1]}) = ${pick.max2}\\text{ 萬元}$$\n2. 方案 A 後悔值：\n   $$${pick.max2} - ${pick.vA[1]} = ${pick.ans}\\text{ 萬元}$$`
    };
  },

  "q-u6-l2-03": function(q) {
    const sets = [
      { v: [180, 90, 30], ans: 100.0 },
      { v: [210, 120, 60], ans: 130.0 },
      { v: [150, 90, 60], ans: 100.0 },
      { v: [240, 150, 60], ans: 150.0 },
      { v: [120, 80, 40], ans: 80.0 }
    ];
    const pick = sets[Math.floor(Math.random() * sets.length)];
    const sum = pick.v[0] + pick.v[1] + pick.v[2];
    return {
      givenData: {
        "繁榮 S1 獲利": `${pick.v[0]} 萬元`,
        "平平 S2 獲利": `${pick.v[1]} 萬元`,
        "衰退 S3 獲利": `${pick.v[2]} 萬元`
      },
      questionPrompt: `某零售商新策略在三種景氣下的預估獲利為：繁榮 S1 獲利 ${pick.v[0]} 萬元、平平 S2 獲利 ${pick.v[1]} 萬元、衰退 S3 獲利 ${pick.v[2]} 萬元。決策者採「機率均等準則（Laplace Criterion）」，請計算該策略的期望平均獲利（萬元）。`,
      correctAnswer: pick.ans,
      unitLabel: "萬元",
      tolerance: 0.1,
      fullSolution: `【動態題解】\nLaplace 假設各情境等機率：\n$$Avg = \\frac{${pick.v[0]} + ${pick.v[1]} + ${pick.v[2]}}{3} = \\frac{${sum}}{3} = ${pick.ans}\\text{ 萬元}$$`
    };
  },

  "q-u6-l3-01": function(q) {
    const matrices = [
      {
        d1: { S1: 50, S2: 120, S3: 180, S4: 250 },
        d2: { S1: 50, S2: 80, S3: 110, S4: 90 },
        d3: { S1: 50, S2: 40, S3: 10, S4: -30 },
        colMax: { D1: 250, D2: 110, D3: 50 },
        regrets: { S1: 200, S2: 130, S3: 70, S4: 80 },
        ansKey: "C",
        optC: "挑選 S3 (中度擴產)，其最大機會損失為 70",
        optD: "挑選 S4 (大幅擴產)，其最大機會損失為 80",
        bestStrat: "S3 (中度擴產)",
        minRegret: 70
      },
      {
        d1: { S1: 60, S2: 140, S3: 200, S4: 270 },
        d2: { S1: 60, S2: 90, S3: 120, S4: 100 },
        d3: { S1: 60, S2: 50, S3: 20, S4: -20 },
        colMax: { D1: 270, D2: 120, D3: 60 },
        regrets: { S1: 210, S2: 130, S3: 70, S4: 80 },
        ansKey: "C",
        optC: "挑選 S3 (中度擴產)，其最大機會損失為 70",
        optD: "挑選 S4 (大幅擴產)，其最大機會損失為 80",
        bestStrat: "S3 (中度擴產)",
        minRegret: 70
      },
      {
        d1: { S1: 40, S2: 110, S3: 160, S4: 220 },
        d2: { S1: 40, S2: 75, S3: 105, S4: 85 },
        d3: { S1: 40, S2: 30, S3: 15, S4: -10 },
        colMax: { D1: 220, D2: 105, D3: 40 },
        regrets: { S1: 180, S2: 110, S3: 60, S4: 50 },
        ansKey: "D",
        optC: "挑選 S3 (中度擴產)，其最大機會損失為 60",
        optD: "挑選 S4 (大幅擴產)，其最大機會損失為 50",
        bestStrat: "S4 (大幅擴產)",
        minRegret: 50
      },
      {
        d1: { S1: 70, S2: 150, S3: 180, S4: 210 },
        d2: { S1: 70, S2: 110, S3: 90, S4: 80 },
        d3: { S1: 70, S2: 45, S3: 20, S4: -15 },
        colMax: { D1: 210, D2: 110, D3: 70 },
        regrets: { S1: 140, S2: 60, S3: 50, S4: 85 },
        ansKey: "C",
        optC: "挑選 S3 (中度擴產)，其最大機會損失為 50",
        optD: "挑選 S4 (大幅擴產)，其最大機會損失為 85",
        bestStrat: "S3 (中度擴產)",
        minRegret: 50
      }
    ];
    const pick = matrices[Math.floor(Math.random() * matrices.length)];
    return {
      givenData: {
        "高需求 D1 各方案獲利": `S1:${pick.d1.S1}, S2:${pick.d1.S2}, S3:${pick.d1.S3}, S4:${pick.d1.S4}`,
        "中需求 D2 各方案獲利": `S1:${pick.d2.S1}, S2:${pick.d2.S2}, S3:${pick.d2.S3}, S4:${pick.d2.S4}`,
        "低需求 D3 各方案獲利": `S1:${pick.d3.S1}, S2:${pick.d3.S2}, S3:${pick.d3.S3}, S4:${pick.d3.S4}`
      },
      questionPrompt: `某製造商評估四種擴產策略（S1 不擴、S2 小擴、S3 中擴、S4 大擴），報酬矩陣如下：\n- S1: D1=${pick.d1.S1}, D2=${pick.d2.S1}, D3=${pick.d3.S1}\n- S2: D1=${pick.d1.S2}, D2=${pick.d2.S2}, D3=${pick.d3.S2}\n- S3: D1=${pick.d1.S3}, D2=${pick.d2.S3}, D3=${pick.d3.S3}\n- S4: D1=${pick.d1.S4}, D2=${pick.d2.S4}, D3=${pick.d3.S4}\n請依「最大機會損失最小化準則（Minimax Regret）」挑選最佳策略。`,
      options: [
        { key: "A", text: `挑選 S1，最大機會損失為 ${pick.regrets.S1}`, distractorFeedback: `S1 最大遺憾 ${pick.regrets.S1} 過大` },
        { key: "B", text: `挑選 S2，最大機會損失為 ${pick.regrets.S2}`, distractorFeedback: `${pick.minRegret} < ${pick.regrets.S2}，遺憾非最小` },
        { key: "C", text: pick.optC, distractorFeedback: pick.ansKey === "C" ? null : `${pick.minRegret} < ${pick.regrets.S3}，遺憾非最小` },
        { key: "D", text: pick.optD, distractorFeedback: pick.ansKey === "D" ? null : `${pick.minRegret} < ${pick.regrets.S4}，遺憾非最小` }
      ],
      correctAnswer: pick.ansKey,
      fullSolution: `【動態題解】\n1. 各需求行最大值：D1=${pick.colMax.D1}, D2=${pick.colMax.D2}, D3=${pick.colMax.D3}。\n2. 各策略最大後悔值：\n   - S1: max(${pick.colMax.D1 - pick.d1.S1}, ${pick.colMax.D2 - pick.d2.S1}, ${pick.colMax.D3 - pick.d3.S1}) = ${pick.regrets.S1}\n   - S2: max(${pick.colMax.D1 - pick.d1.S2}, ${pick.colMax.D2 - pick.d2.S2}, ${pick.colMax.D3 - pick.d3.S2}) = ${pick.regrets.S2}\n   - S3: max(${pick.colMax.D1 - pick.d1.S3}, ${pick.colMax.D2 - pick.d2.S3}, ${pick.colMax.D3 - pick.d3.S3}) = ${pick.regrets.S3}\n   - S4: max(${pick.colMax.D1 - pick.d1.S4}, ${pick.colMax.D2 - pick.d2.S4}, ${pick.colMax.D3 - pick.d3.S4}) = ${pick.regrets.S4}\n3. 最小最大後悔值為 ${pick.minRegret}，對應挑選「${pick.bestStrat}」。`
    };
  },

  "q-u6-l3-02": function(q) {
    const combos = [
      { d1: [40, 60, 90], d2: [50, 55, 75], d3: [70, 65, 60], ans: 30.0 },
      { d1: [35, 55, 85], d2: [45, 50, 70], d3: [65, 60, 55], ans: 30.0 },
      { d1: [50, 70, 100], d2: [60, 65, 85], d3: [80, 75, 70], ans: 30.0 }
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    return {
      givenData: {
        "D1 方案成本 (S1, S2, S3)": `(${pick.d1.join(", ")})`,
        "D2 方案成本 (S1, S2, S3)": `(${pick.d2.join(", ")})`,
        "D3 方案成本 (S1, S2, S3)": `(${pick.d3.join(", ")})`
      },
      questionPrompt: `物流公司三種車隊方案成本（萬元）：\n- D1: S1=${pick.d1[0]}, S2=${pick.d1[1]}, S3=${pick.d1[2]}\n- D2: S1=${pick.d2[0]}, S2=${pick.d2[1]}, S3=${pick.d2[2]}\n- D3: S1=${pick.d3[0]}, S2=${pick.d3[1]}, S3=${pick.d3[2]}\n請建立成本後悔矩陣，計算最優方案之「最大機會損失（Minimax Regret）」數值（萬元）。`,
      correctAnswer: pick.ans,
      unitLabel: "萬元",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n1. 各情境最低成本：S1=${pick.d1[0]}, S2=${pick.d2[1]}, S3=${pick.d3[2]}。\n2. 計算各方案最大後悔值：\n   - D1: max(${pick.d1[0]-pick.d1[0]}, ${pick.d1[1]-pick.d2[1]}, ${pick.d1[2]-pick.d3[2]}) = ${pick.d1[2]-pick.d3[2]}\n   - D2: max(${pick.d2[0]-pick.d1[0]}, ${pick.d2[1]-pick.d2[1]}, ${pick.d2[2]-pick.d3[2]}) = ${pick.d2[2]-pick.d3[2]}\n   - D3: max(${pick.d3[0]-pick.d1[0]}, ${pick.d3[1]-pick.d2[1]}, ${pick.d3[2]-pick.d3[2]}) = ${pick.d3[0]-pick.d1[0]}\n3. 最小者為 ${pick.ans} 萬元。`
    };
  },

  "q-u6-l4-01": function(q) {
    const scaleList = [1, 2, 3, 5, 10];
    const s = scaleList[Math.floor(Math.random() * scaleList.length)];
    const laplaceS1 = (38 * s / 3).toFixed(2);
    const laplaceBest = (20 * s).toFixed(1);
    return {
      givenData: {
        "CA1 獲利 (S1-S4)": `(${13*s}, ${9*s}, ${24*s}, ${18*s})`,
        "CA2 獲利 (S1-S4)": `(${14*s}, ${15*s}, ${21*s}, ${14*s})`,
        "CA3 獲利 (S1-S4)": `(${11*s}, ${18*s}, ${15*s}, ${28*s})`
      },
      questionPrompt: `【作業 1107 題三實戰】四促銷策略（S1-S4）面對對手三行動（CA1-CA3）獲利矩陣：\n- CA1: (${13*s}, ${9*s}, ${24*s}, ${18*s})\n- CA2: (${14*s}, ${15*s}, ${21*s}, ${14*s})\n- CA3: (${11*s}, ${18*s}, ${15*s}, ${28*s})\n請在紙筆上手算完整推導四大不確定決策準則之最優策略：\n(1) 樂觀準則 (Maximax)；\n(2) 悲觀準則 (Maximin)；\n(3) 機率均等準則 (Laplace)；\n(4) 最大機會損失最小化準則 (Minimax Regret)。`,
      fullSolution: `【動態題解】\n1. 樂觀準則：全場最大獲利 ${28*s}（選 S4）。\n2. 悲觀準則：各方案最差為 S1:${11*s}, S2:${9*s}, S3:${15*s}, S4:${14*s}，取最大 ${15*s}（選 S3）。\n3. Laplace 準則：平均獲利 S1:${laplaceS1}, S2:${14*s}, S3:${20*s}, S4:${20*s}（S3 與 S4 並列最佳 ${laplaceBest} 萬）。\n4. Minimax Regret：各策略最大後悔為 S1:${17*s}, S2:${15*s}, S3:${13*s}, S4:${7*s}，最小為 ${7*s}（選 S4）。`
    };
  },

  "q-u6-l4-02": function(q) {
    const scaleList = [1, 2, 3, 5, 10];
    const s = scaleList[Math.floor(Math.random() * scaleList.length)];
    const ans = 7.0 * s;
    return {
      givenData: {
        "CA1 獲利 (S1-S4)": `(${13*s}, ${9*s}, ${24*s}, ${18*s})`,
        "CA2 獲利 (S1-S4)": `(${14*s}, ${15*s}, ${21*s}, ${14*s})`,
        "CA3 獲利 (S1-S4)": `(${11*s}, ${18*s}, ${15*s}, ${28*s})`
      },
      questionPrompt: `承接作業 1107 題三：促銷策略（S1-S4）面對競爭行動（CA1-CA3）獲利矩陣如下：\n- CA1: S1=${13*s}, S2=${9*s}, S3=${24*s}, S4=${18*s}\n- CA2: S1=${14*s}, S2=${15*s}, S3=${21*s}, S4=${14*s}\n- CA3: S1=${11*s}, S2=${18*s}, S3=${15*s}, S4=${28*s}\n請依「最大機會損失最小化準則（Minimax Regret）」計算遺憾矩陣，求出最優決策策略之「最小最大機會損失數值」（萬元）。`,
      correctAnswer: ans,
      unitLabel: "萬元",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n1. 各行動行最大獲利：CA1=${24*s}, CA2=${21*s}, CA3=${28*s}。\n2. 各策略最大後悔值：\n   - S1 最大後悔：${17*s}\n   - S2 最大後悔：${15*s}\n   - S3 最大後悔：${13*s}\n   - S4 最大後悔：${7*s}\n3. 最小最大機會損失為 ${ans} 萬元（對應最佳策略 S4）。`
    };
  }
};


/**
 * 動態參數生成器呼叫介面
 */
function generateDynamicQuestion(dynamicType, originalQ) {
  if (originalQ && typeof originalQ.generator === "function") {
    return originalQ.generator(originalQ);
  }
  if (DYNAMIC_GENERATORS[dynamicType]) {
    return DYNAMIC_GENERATORS[dynamicType](originalQ);
  }
  if (dynamicType === "cagr") return DYNAMIC_GENERATORS["q-u1-l2-01"](originalQ);
  if (dynamicType === "percentile") return DYNAMIC_GENERATORS["q-u1-l2-02"](originalQ);
  if (dynamicType === "cv") return DYNAMIC_GENERATORS["q-u1-l2-03"](originalQ);
  if (dynamicType === "smc_jaccard") return DYNAMIC_GENERATORS["q-u2-l2-01"](originalQ);
  if (dynamicType === "bayes") return DYNAMIC_GENERATORS["q-u3-l2-01"](originalQ);
  return null;
}

// 自動將生成器與動態標記綁定至 RAW_QUESTIONS 中等級 2 以上之題目
if (typeof RAW_QUESTIONS !== "undefined" && Array.isArray(RAW_QUESTIONS)) {
  RAW_QUESTIONS.forEach(q => {
    if (DYNAMIC_GENERATORS[q.id]) {
      q.hasDynamic = true;
      q.hasDynamicGenerator = true;
      q.dynamicType = q.id;
      q.generator = DYNAMIC_GENERATORS[q.id];
    }
  });
}

// 註冊至全域 window 物件
if (typeof window !== "undefined") {
  window.DYNAMIC_GENERATORS = DYNAMIC_GENERATORS;
  window.generateDynamicQuestion = generateDynamicQuestion;
}
