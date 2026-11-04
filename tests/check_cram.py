import json
import os
import re
import subprocess

html = """<!DOCTYPE html>
<html>
<head><script src="js/questions.js"></script></head>
<body>
<div id="res"></div>
<script>
  const missing = [];
  RAW_QUESTIONS.forEach(q => {
    if (!q.cramSummary || !q.cramSummary.conceptName || !q.cramSummary.keyTakeaway) {
      missing.push({ id: q.id, issue: 'missing cramSummary' });
    }
    if (!q.formulaHint) {
      missing.push({ id: q.id, issue: 'missing formulaHint' });
    } else {
      if (q.formulaHint.includes("$$") || q.formulaHint.startsWith("$") || q.formulaHint.endsWith("$")) {
        missing.push({ id: q.id, issue: 'formulaHint contains dollar delimiters: ' + q.formulaHint });
      }
    }
  });
  document.getElementById('res').textContent = JSON.stringify(missing);
</script>
</body>
</html>
"""

with open("temp_cram_check.html", "w", encoding="utf-8") as f:
    f.write(html)

edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
path = os.path.abspath("temp_cram_check.html").replace("\\", "/")
res = subprocess.run([edge, "--headless", "--disable-gpu", "--dump-dom", f"file:///{path}"], capture_output=True, encoding="utf-8")

m = re.search(r'<div id="res">(.*?)</div>', res.stdout, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    print(f"Missing items: {len(data)}")
    for item in data:
        print(item)
else:
    print("Could not find res")
