import json
import subprocess
import os

html = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<div id="output"></div>
<script>
function parseUserInput(rawVal, unitLabel) {
  if (!rawVal || !rawVal.trim()) return { error: "empty" };

  // 1. 全形轉半形 (含全形數字、小數點、正負號、斜線、百分比、千分位逗點)
  let clean = rawVal
    .replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ")
    .trim();

  // 2. 處理結尾百分比符號 (含半形 % 與全形轉半形之 %)
  let hasPercentSign = false;
  if (clean.endsWith("%")) {
    hasPercentSign = true;
    clean = clean.slice(0, -1).trim();
  }

  // 3. 移除常見中文題目單位後綴 (例如: 萬元, 萬, 元, 筆, 個, 人, 次, 間) 或指定的 unitLabel (非 %)
  if (unitLabel && unitLabel.trim() && unitLabel.trim() !== "%") {
    const esc = unitLabel.trim().replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
    clean = clean.replace(new RegExp(esc + "$", "i"), "").trim();
  }
  clean = clean.replace(/(?:萬元|萬|元|筆|個|人|次|間|組)$/, "").trim();

  // 4. 移除千分位逗號與多餘空白 (如 "1, 600" 或 "1,600")
  clean = clean.replace(/,/g, "").trim();

  // 5. 判斷分數格式 (如 14/15, 1/2, -3/4)
  let userNum = NaN;
  if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts.length === 2) {
      const numStr = parts[0].trim();
      const denStr = parts[1].trim();
      if (/^[-+]?\\d+(?:\\.\\d+)?$/.test(numStr) && /^[-+]?\\d+(?:\\.\\d+)?$/.test(denStr)) {
        const num = parseFloat(numStr);
        const den = parseFloat(denStr);
        if (den !== 0 && isFinite(num) && isFinite(den)) {
          userNum = num / den;
        }
      }
    }
  } else {
    // 嚴格數字正則比對，杜絕 "1.2.3" 或 "12abc" 等非法字串被 parseFloat 誤判
    if (/^[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:[eE][-+]?\\d+)?$/.test(clean)) {
      userNum = Number(clean);
    }
  }

  if (isNaN(userNum) || !isFinite(userNum)) {
    return { error: "invalid" };
  }

  return { value: userNum, hasPercentSign };
}

const testCases = [
  { input: "50", unit: "%", expected: 50, hasPct: false },
  { input: "50%", unit: "%", expected: 50, hasPct: true },
  { input: "50 %", unit: "%", expected: 50, hasPct: true },
  { input: "５０", unit: "%", expected: 50, hasPct: false },
  { input: "５０％", unit: "%", expected: 50, hasPct: true },
  { input: "３９．６", unit: "元", expected: 39.6, hasPct: false },
  { input: "１／２", unit: "", expected: 0.5, hasPct: false },
  { input: "1,600", unit: "萬元", expected: 1600, hasPct: false },
  { input: "１，６００", unit: "萬元", expected: 1600, hasPct: false },
  { input: "38萬元", unit: "萬元", expected: 38, hasPct: false },
  { input: "38 萬元", unit: "萬元", expected: 38, hasPct: false },
  { input: "-10", unit: "", expected: -10, hasPct: false },
  { input: "－１０", unit: "", expected: -10, hasPct: false },
  { input: "+5.25", unit: "", expected: 5.25, hasPct: false },
  { input: "1.2.3", unit: "", expectedErr: "invalid" },
  { input: "12abc", unit: "", expectedErr: "invalid" },
  { input: "1/2/3", unit: "", expectedErr: "invalid" },
  { input: "1/0", unit: "", expectedErr: "invalid" },
  { input: "abc", unit: "", expectedErr: "invalid" }
];

const results = [];
for (let tc of testCases) {
  const res = parseUserInput(tc.input, tc.unit);
  let pass = false;
  if (tc.expectedErr) {
    pass = res.error === tc.expectedErr;
  } else {
    pass = !res.error && Math.abs(res.value - tc.expected) < 1e-6 && res.hasPercentSign === tc.hasPct;
  }
  results.push({ ...tc, actual: res, pass });
}

document.getElementById("output").textContent = JSON.stringify(results);
</script>
</body>
</html>
"""

with open("temp_test_parser.html", "w", encoding="utf-8") as f:
    f.write(html)

edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
path = os.path.abspath("temp_test_parser.html").replace("\\", "/")
res = subprocess.run([edge, "--headless", "--disable-gpu", "--dump-dom", f"file:///{path}"], capture_output=True, encoding="utf-8")

import re
m = re.search(r'<div id="output">(.*?)</div>', res.stdout, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    all_pass = all(item['pass'] for item in data)
    print(f"All parser tests pass: {all_pass}")
    for item in data:
        if not item['pass']:
            print(f"FAILED: {item}")
        else:
            print(f"PASS: {item['input']} -> {item['actual']}")
