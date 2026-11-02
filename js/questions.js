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
    name: "單元六：不確定決策準則與決策樹",
    shortName: "決策分析",
    icon: "🌳",
    desc: "樂觀/悲觀/機會損失最小化、兩階段決策樹逆向回推與 EVSI"
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
        text: "L_x = \\frac{x}{100} \\times n",
        distractorFeedback: "這是某些簡易概算法，但未考量起點坐標為 1，不符合課堂板書標準。"
      },
      {
        key: "B",
        text: "L_x = \\frac{x}{100} \\times (n - 1) + 1",
        distractorFeedback: null
      },
      {
        key: "C",
        text: "L_x = \\frac{x}{100} \\times (n + 1)",
        distractorFeedback: "這是舊版教科書或少數統計軟體公式（投影片 Slide 31 筆誤處即在此），課堂板書 IMG_0130 明確規定採 (n-1)+1。"
      },
      {
        key: "D",
        text: "L_x = \\frac{x}{100} \\times (n + 1) - 1",
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
    tolerance: 0,
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
    tolerance: 0,
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

  // ==========================================
  // 單元六：不確定決策準則與決策樹 (ch13-decision)
  // ==========================================
  {
    id: "q-u6-l1-01",
    unit: "ch13-decision",
    unitName: "不確定決策準則與決策樹",
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
    id: "q-u6-l2-01",
    unit: "ch13-decision",
    unitName: "不確定決策準則與決策樹",
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
    id: "q-u6-l3-01",
    unit: "ch13-decision",
    unitName: "不確定決策準則與決策樹",
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
        distractorFeedback: "S1 在高需求時遺憾為 250 - 50 = 200，非常龐大。"
      },
      {
        key: "B",
        text: "挑選 S2，最大機會損失為 130",
        distractorFeedback: "130 不是所有方案的最大遺憾中最小的。"
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
    id: "q-u6-l4-01",
    unit: "ch13-decision",
    unitName: "不確定決策準則與決策樹",
    level: 4,
    type: "self-check",
    title: "作業必出魔王題：兩階段概念店試驗與貝氏逆向決策樹（含分支修剪與 EVSI）",
    questionPrompt: "【情境描述】某連鎖健身品牌評估進軍新都會區，決策選項如下：\n- 方案 1：先開 1 家概念體驗館試驗（耗資 200 萬元），再依測試成敗決定全面拓點或退出。\n- 方案 2：直接全面開設 15 家門市（全面成功獲利 6,000 萬元；全面失敗虧損 3,000 萬元）。\n- 方案 3：完全放棄（獲利為 0）。\n【先驗與測試精度】\n- 全面成功先驗機率 $P(AS) = 0.60$，$P(AF) = 0.40$。\n- 概念店成功條件機率：$P(BS|AS) = 0.80$；概念店失敗條件機率：$P(BF|AF) = 0.85$。\n【請推導回答】\n(1) 邊界機率 $P(BS)$、$P(BF)$ 及後驗機率 $P(AS|BS)$、$P(AS|BF)$。\n(2) 利用逆向期望值回推法（Backward Induction），分析概念店失敗時是否應修剪分支（Pruning）？求各方案總期望收益與樣本資訊期望價值（EVSI），給出最優決策建議。",
    givenData: {
      "先驗機率": "P(AS) = 0.60, P(AF) = 0.40",
      "條件機率": "P(BS|AS) = 0.80, P(BF|AF) = 0.85",
      "獲利/虧損": "成功 +6,000 萬, 失敗 -3,000 萬",
      "試驗成本": "200 萬元"
    },
    formulaHint: "EMV = \\sum p_i V_i, \\quad EVSI = EMV_{\\text{有資訊無成本}} - EMV_{\\text{無資訊最佳}}",
    fullSolution: "【Step 1：全機率計算邊界機率】\n- 概念店成功機率：\n  $P(BS) = 0.80 \\times 0.60 + 0.15 \\times 0.40 = 0.48 + 0.06 = 0.54$\n- 概念店失敗機率：\n  $P(BF) = 0.20 \\times 0.60 + 0.85 \\times 0.40 = 0.12 + 0.34 = 0.46$\n\n【Step 2：貝氏定理更新後驗機率】\n- 概念店成功下全面成功：$P(AS|BS) = 0.48 / 0.54 = 8/9 \\approx 0.8889$\n- 概念店失敗下全面成功：$P(AS|BF) = 0.12 / 0.46 = 6/23 \\approx 0.2609$\n\n【Step 3：末端決策節點期望值與分支修剪 (Pruning)】\n- 若概念店成功：\n  開店期望值 $= (8/9)(6000) + (1/9)(-3000) = 5000 - 333.33 = +5,000$ 萬元。\n  不開店獲利 $= 0$。\n  $\\implies$ 必選擇全面開店，節點價值 $= +5,000$ 萬元。\n- 若概念店失敗：\n  若仍開店期望值 $= (6/23)(6000) + (17/23)(-3000) = -652.17$ 萬元 $< 0$。\n  若不開店獲利 $= 0$。\n  $\\implies$ 理性決策者必定及時止損不開店（修剪開店分支！），節點價值 $= 0$ 萬元！\n\n【Step 4：方案總期望值逆向回推】\n- 方案 3（不進入）：獲利 $= 0$ 萬元。\n- 方案 2（直接設店）：$EMV_2 = 0.60(6000) + 0.40(-3000) = 3600 - 1200 = +2,400$ 萬元。\n- 方案 1（先開概念店）：\n  $EMV_1 = -200 + [0.54 \\times 5000 + 0.46 \\times 0] = -200 + 2700 = +2,500$ 萬元。\n\n【Step 5：EVSI 與最佳策略】\n- $EVSI = 2700 - 2400 = 300$ 萬元。\n- 因 $EVSI (300 萬) >$ 測試成本 (200 萬)，試驗具高度經濟價值！\n- 最佳決策：**選擇方案 1（先開概念店）**。成功時全面拓點，失敗時果斷止損退出！",
    cramSummary: {
      conceptName: "貝氏決策樹與分支修剪",
      keyTakeaway: "概念店失敗時全面開店 EMV = -652 萬 < 0，必定剪枝選擇 0！方案 1 總 EMV = -200 + 2700 = +2500 萬 > 2400 萬。"
    }
  }
];

/**
 * 動態參數生成器 (Dynamic Parameter Generator)
 * 為打底練習題生成隨機參數，防止死背答案
 */
function generateDynamicQuestion(dynamicType) {
  if (dynamicType === "cagr") {
    // 隨機選一組漂亮的整數開方組合
    const combos = [
      { v0: 1000, t: 3, ratio: 8, ans: 100, label: "1,000 萬增至 8,000 萬，歷經 3 期" }, // 8^(1/3) = 2 -> 100%
      { v0: 1600, t: 4, ratio: 5.0625, ans: 50, label: "1,600 萬增至 8,100 萬，歷經 4 期" }, // (81/16)^(1/4) = 1.5 -> 50%
      { v0: 2000, t: 2, ratio: 2.25, ans: 50, label: "2,000 萬增至 4,500 萬，歷經 2 期" }, // (45/20)^0.5 = 1.5 -> 50%
      { v0: 2500, t: 2, ratio: 1.44, ans: 20, label: "2,500 萬增至 3,600 萬，歷經 2 期" }, // 1.2 -> 20%
      { v0: 1000, t: 3, ratio: 1.728, ans: 20, label: "1,000 萬增至 1,728 萬，歷經 3 期" } // 1.2 -> 20%
    ];
    const pick = combos[Math.floor(Math.random() * combos.length)];
    const vt = Math.round(pick.v0 * pick.ratio);
    return {
      givenData: {
        "期初營收 V0": `${pick.v0.toLocaleString()} 萬元`,
        "期末營收 Vt": `${vt.toLocaleString()} 萬元`,
        "跨越期數 t": `${pick.t} 年`
      },
      questionPrompt: `某連鎖企業年營收由期初的 ${pick.v0.toLocaleString()} 萬元成長為期末的 ${vt.toLocaleString()} 萬元（跨越期數為 ${pick.t} 年）。請計算其營收年增率的幾何平均數（%）。`,
      correctAnswer: pick.ans,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解】\\(CAGR = (${vt} / ${pick.v0})^{1/${pick.t}} - 1 = (${pick.ratio})^{1/${pick.t}} - 1 = ${1 + pick.ans/100} - 1 = ${pick.ans}\\%\\)。`
    };
  }

  if (dynamicType === "percentile") {
    // 隨機生成 9 筆已排序數值與抽測百分位數
    const base = Math.floor(Math.random() * 15) + 10;
    const diffs = [5, 4, 6, 6, 6, 8, 10, 12];
    let nums = [base];
    for (let d of diffs) {
      nums.push(nums[nums.length - 1] + d);
    }
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
        "排序數列": `[${nums.join(", ")}]`,
        "樣本數 n": `${n}`,
        "目標百分位 x": `${x}`
      },
      questionPrompt: `現有一組由小至大排序之 9 筆數據：\n\`${nums.join(", ")}\`（$n = 9$）。\n請依課堂板書唯一標準公式求出「第 ${x} 百分位數對應之數值」。`,
      correctAnswer: ans,
      unitLabel: "",
      tolerance: 0.05,
      fullSolution: `【動態題解】\n1. 位置 \\(L_{${x}} = \\frac{${x}}{100} \\times (9 - 1) + 1 = ${L.toFixed(2)}\\)。\n2. 整數項 \\(p = ${p}\\)，小數項 \\(0.d = ${d.toFixed(2)}\\)。\n3. 第 ${p} 筆為 ${x_p}，第 ${p+1} 筆為 ${x_p1}。\n4. 內插數值 \\(P_{${x}} = ${x_p} + ${d.toFixed(2)} \\times (${x_p1} - ${x_p}) = ${ans}\\)。`
    };
  }

  if (dynamicType === "smc_jaccard") {
    // 隨機微調列聯表
    const a = Math.floor(Math.random() * 4) + 4; // 4 ~ 7 (雙0)
    const b = Math.floor(Math.random() * 2) + 1; // 1 ~ 2
    const c = Math.floor(Math.random() * 2) + 1; // 1 ~ 2
    const d = Math.floor(Math.random() * 2) + 2; // 2 ~ 3
    const N = a + b + c + d;
    const smc = Math.round(((a + d) / N) * 100) / 100;
    const jaccard = Math.round((d / (b + c + d)) * 100) / 100;

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
      fullSolution: `【動態題解】\n\\(SMC = \\frac{a + d}{N} = \\frac{${a} + ${d}}{${N}} = \\frac{${a+d}}{${N}} = ${smc}\\)。\n(補充：Jaccard = \\(\\frac{d}{b+c+d} = \\frac{${d}}{${b+c+d}} = ${jaccard}\\))`
    };
  }

  if (dynamicType === "cv") {
    const centers = [20, 30, 40, 50];
    const mean = centers[Math.floor(Math.random() * centers.length)];
    const offsets = [-2, -1, 0, 1, 2];
    const nums = offsets.map(o => mean + o);
    // mean is mean, sum of sq is 4+1+0+1+4 = 10. S^2 = 10 / 4 = 2.5, S = sqrt(2.5) ~ 1.5811
    const s = Math.sqrt(2.5);
    const cv = Math.round((s / mean) * 10000) / 100;

    return {
      givenData: {
        "樣本數值": `[${nums.join(", ")}]`,
        "樣本數 n": "5"
      },
      questionPrompt: `抽檢 5 批零件數值為：\`${nums.join(", ")}\`。請計算該樣本之「變異係數 CV（%）」（四捨五入至小數後兩位）。`,
      correctAnswer: cv,
      unitLabel: "%",
      tolerance: 0.1,
      fullSolution: `【動態題解】\n1. 平均數 \\(\\bar{X} = ${mean}\\)。\n2. 離均差平方和 \\(\\sum(X_i - ${mean})^2 = 4 + 1 + 0 + 1 + 4 = 10\\)。\n3. 樣本標準差 \\(S = \\sqrt{10 / 4} = \\sqrt{2.5} \\approx 1.5811\\)。\n4. \\(CV = 1.5811 / ${mean} \\approx ${cv}\\%\\)。`
    };
  }

  if (dynamicType === "bayes") {
    // 隨機微調良品率與偽陽性率
    const pD = 0.20;
    const pG = 0.80;
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
      fullSolution: `【動態題解】\n1. 全機率 \\(P(T^+) = (${pT_D} \\times ${pD}) + (${pT_G} \\times ${pG}) = ${num.toFixed(3)} + ${(pT_G*pG).toFixed(3)} = ${den.toFixed(3)}\\)。\n2. 後驗機率 \\(P(D|T^+) = ${num.toFixed(3)} / ${den.toFixed(3)} \\approx ${ans}\\%\\)。`
    };
  }

  return null;
}
