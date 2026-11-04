import subprocess
import json
import os
import http.server
import socketserver
import threading
import time

PORT = 8792

html = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="js/questions.js"></script>
</head>
<body>
  <div id="results"></div>
  <script>
    window.addEventListener("DOMContentLoaded", () => {
      const results = [];
      Object.keys(DYNAMIC_GENERATORS).forEach(qid => {
        const q = RAW_QUESTIONS.find(item => item.id === qid);
        for (let i = 0; i < 20; i++) {
          const res = DYNAMIC_GENERATORS[qid](q);
          const p = res.questionPrompt || res.prompt || "";
          const sol = res.fullSolution || "";

          // Check dollar count in p and sol
          const pDollars = (p.match(/(?<!\\\\)\\$/g) || []).length;
          const solDollars = (sol.match(/(?<!\\\\)\\$/g) || []).length;

          // Check \\( and \\) count
          const pOpenParen = (p.match(/\\\\\\(/g) || []).length;
          const pCloseParen = (p.match(/\\\\\\)/g) || []).length;
          const solOpenParen = (sol.match(/\\\\\\(/g) || []).length;
          const solCloseParen = (sol.match(/\\\\\\)/g) || []).length;

          if (pDollars % 2 !== 0) {
            results.push({ qid, field: "prompt", error: "Unbalanced $ count: " + pDollars });
          }
          if (solDollars % 2 !== 0) {
            results.push({ qid, field: "sol", error: "Unbalanced $ count: " + solDollars });
          }
          if (pOpenParen !== pCloseParen) {
            results.push({ qid, field: "prompt", error: `Mismatched \\\\( (${pOpenParen}) and \\\\) (${pCloseParen})` });
          }
          if (solOpenParen !== solCloseParen) {
            results.push({ qid, field: "sol", error: `Mismatched \\\\( (${solOpenParen}) and \\\\) (${solCloseParen})` });
          }
        }
      });
      document.getElementById("results").textContent = JSON.stringify(results);
    });
  </script>
</body>
</html>
"""

with open("temp_test_math.html", "w", encoding="utf-8") as f:
    f.write(html)

class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("", PORT), SilentHandler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()
time.sleep(1)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--dump-dom",
    f"http://127.0.0.1:{PORT}/temp_test_math.html"
]

try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    dom = res.stdout
    start = dom.find('<div id="results">') + len('<div id="results">')
    end = dom.find('</div>', start)
    json_str = dom[start:end]
    data = json.loads(json_str)
    
    print(f"Math syntax errors count: {len(data)}")
    for err in data:
        print(" ", err)
finally:
    if os.path.exists("temp_test_math.html"):
        os.remove("temp_test_math.html")
    httpd.shutdown()
