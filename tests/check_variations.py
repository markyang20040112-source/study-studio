import subprocess
import json
import os
import http.server
import socketserver
import threading
import time

PORT = 8791

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
      const results = {};
      Object.keys(DYNAMIC_GENERATORS).forEach(qid => {
        const q = RAW_QUESTIONS.find(item => item.id === qid);
        const outputs = new Set();
        for (let i = 0; i < 30; i++) {
          const res = DYNAMIC_GENERATORS[qid](q);
          const signature = JSON.stringify({
            prompt: res.questionPrompt || res.prompt,
            ans: res.correctAnswer,
            sol: res.fullSolution
          });
          outputs.add(signature);
        }
        results[qid] = {
          distinctCount: outputs.size,
          isStatic: outputs.size <= 1
        };
      });
      document.getElementById("results").textContent = JSON.stringify(results);
    });
  </script>
</body>
</html>
"""

with open("temp_test3.html", "w", encoding="utf-8") as f:
    f.write(html)

class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("", PORT), SilentHandler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()
time.sleep(1)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--virtual-time-budget=5000",
    "--dump-dom",
    f"http://127.0.0.1:{PORT}/temp_test3.html"
]

try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    dom = res.stdout
    start = dom.find('<div id="results">') + len('<div id="results">')
    end = dom.find('</div>', start)
    json_str = dom[start:end]
    data = json.loads(json_str)
    
    static_qs = [qid for qid, info in data.items() if info['isStatic']]
    print(f"Total dynamic generators: {len(data)}")
    print(f"Generators that have NO variations (STATIC) ({len(static_qs)}): {static_qs}")
    for qid in static_qs:
        print(f"  - {qid}")
        
    for qid, info in data.items():
        if not info['isStatic']:
            print(f"  {qid}: {info['distinctCount']} distinct variations")
finally:
    if os.path.exists("temp_test3.html"):
        os.remove("temp_test3.html")
    httpd.shutdown()
