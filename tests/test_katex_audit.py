import sys
import subprocess
import json
import os
import http.server
import socketserver
import threading
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

PORT = 8795

html = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/math.css">
  <script src="js/questions.js"></script>
  <script src="js/storage.js"></script>
</head>
<body>
  <div id="contentArea"></div>
  <div id="activeModeBadge"></div>
  <div id="unitHeaderArea"></div>
  <div id="overallMasteryText"></div>
  <div id="overallProgressBar"></div>
  <div id="statMasteredCount"></div>
  <div id="statReviewCount"></div>
  <div id="statUnattemptedCount"></div>
  <div id="unitListContainer"></div>
  <div id="levelTabsContainer"></div>
  <div id="testContainer"></div>
  <div id="results"></div>
  <script src="js/app.js"></script>
  <script>
    window.addEventListener("DOMContentLoaded", () => {
      const katexErrors = [];

      function checkErrors(context) {
        const errors = document.querySelectorAll(".katex-error");
        errors.forEach(err => {
          katexErrors.push({
            context: context,
            title: err.getAttribute("title") || err.textContent,
            html: err.outerHTML
          });
          err.remove(); // Remove to not count again
        });
      }

      // 1. Audit all Unit Walkthroughs (Level 0)
      const units = [
        "ch02-descriptive",
        "ch02-similarity",
        "ch03-probability",
        "ch06-regression",
        "ch10-lp",
        "ch13-decision"
      ];

      units.forEach(u => {
        currentUnitId = u;
        currentLevel = 0;
        renderMainContent();
        // Wait/render math
        renderMath(elContentArea);
        checkErrors("walkthrough:" + u);
      });

      // 2. Audit all Static Questions (Level 1-4)
      units.forEach(u => {
        for (let lvl = 1; lvl <= 4; lvl++) {
          currentUnitId = u;
          currentLevel = lvl;
          renderMainContent();
          renderMath(elContentArea);
          checkErrors(`questions:${u}:lvl${lvl}`);
        }
      });

      // 3. Audit all Dynamic Generators (5 iterations each)
      RAW_QUESTIONS.forEach(q => {
        if (typeof DYNAMIC_GENERATORS !== "undefined" && DYNAMIC_GENERATORS[q.id]) {
          for (let i = 0; i < 5; i++) {
            try {
              const res = DYNAMIC_GENERATORS[q.id](q);
              const testDiv = document.createElement("div");
              testDiv.innerHTML = (res.questionPrompt || res.prompt || "") + " " + (res.fullSolution || "");
              document.body.appendChild(testDiv);
              renderMath(testDiv);
              const errs = testDiv.querySelectorAll(".katex-error");
              errs.forEach(err => {
                katexErrors.push({
                  context: `dynamic:${q.id}:iter${i}`,
                  title: err.getAttribute("title") || err.textContent,
                  html: err.outerHTML,
                  snippet: testDiv.textContent.slice(0, 100)
                });
              });
              testDiv.remove();
            } catch (e) {
              katexErrors.push({
                context: `dynamic_gen_throw:${q.id}:iter${i}`,
                title: e.message
              });
            }
          }
        }
      });

      document.getElementById("results").textContent = JSON.stringify(katexErrors);
    });
  </script>
</body>
</html>
"""

with open("temp_test_katex.html", "w", encoding="utf-8") as f:
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
    f"http://127.0.0.1:{PORT}/temp_test_katex.html"
]

try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    dom = res.stdout
    start = dom.find('<div id="results">') + len('<div id="results">')
    end = dom.find('</div>', start)
    json_str = dom[start:end]
    data = json.loads(json_str)
    
    with open("katex_errors.json", "w", encoding="utf-8") as f_err:
        json.dump(data, f_err, ensure_ascii=False, indent=2)
    print(f"Saved {len(data)} errors to katex_errors.json")
finally:
    if os.path.exists("temp_test_katex.html"):
        os.remove("temp_test_katex.html")
    httpd.shutdown()
