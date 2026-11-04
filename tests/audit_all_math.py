import subprocess
import json
import os
import http.server
import socketserver
import threading
import time
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

PORT = 8796

html = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
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
  <div id="results"></div>
  <script>
    window.onerror = function(msg, url, line) {
      document.getElementById("results").textContent = JSON.stringify([{ context: "uncaught", error: msg + " at " + line }]);
    };
  </script>
  <script src="js/app.js"></script>
  <script>
    window.addEventListener("DOMContentLoaded", () => {
      const issues = [];

      function checkTextForBadEscapes(str, context) {
        if (!str || typeof str !== "string") return;
        if (str.includes("\\x08")) {
          issues.push({ context, error: "Contains \\x08 (unescaped \\b, e.g. \\bar)", snippet: str.slice(0, 120) });
        }
        if (str.includes("\\x0c")) {
          issues.push({ context, error: "Contains \\x0c (unescaped \\f, e.g. \\frac)", snippet: str.slice(0, 120) });
        }
        // Test KaTeX parse directly on every $...$, $$...$$, \\(...\\)
        const testEl = document.createElement("div");
        testEl.innerHTML = str;
        document.body.appendChild(testEl);
        renderMath(testEl);
        const errs = testEl.querySelectorAll(".katex-error");
        errs.forEach(e => {
          issues.push({
            context,
            error: "KaTeX parse error: " + (e.getAttribute("title") || e.textContent),
            katexHTML: e.outerHTML,
            snippet: str.slice(0, 120)
          });
        });
        testEl.remove();
      }

      // Check Walkthroughs
      const units = ["ch02-descriptive", "ch02-similarity", "ch03-probability", "ch06-regression", "ch10-lp", "ch13-decision"];
      units.forEach(u => {
        currentUnitId = u;
        currentLevel = 0;
        renderMainContent();
        renderMath(elContentArea);
        const errs = elContentArea.querySelectorAll(".katex-error");
        errs.forEach(e => {
          issues.push({
            context: "walkthrough:" + u,
            error: "KaTeX parse error: " + (e.getAttribute("title") || e.textContent),
            katexHTML: e.outerHTML
          });
        });
        if (elContentArea.innerHTML.includes("\\x08") || elContentArea.innerHTML.includes("\\x0c")) {
          issues.push({ context: "walkthrough:" + u, error: "Walkthrough HTML contains \\x08 or \\x0c" });
        }
      });

      // Check all raw questions
      RAW_QUESTIONS.forEach(q => {
        checkTextForBadEscapes(q.questionPrompt || q.prompt, `raw:${q.id}:prompt`);
        checkTextForBadEscapes(q.formulaHint, `raw:${q.id}:formulaHint`);
        checkTextForBadEscapes(q.fullSolution, `raw:${q.id}:fullSolution`);
        if (q.options) {
          q.options.forEach((opt, idx) => {
            const txt = typeof opt === "object" ? opt.text : opt;
            checkTextForBadEscapes(txt, `raw:${q.id}:opt${idx}`);
          });
        }
      });

      // Check dynamic generators 10 times each
      Object.keys(DYNAMIC_GENERATORS).forEach(qid => {
        const q = RAW_QUESTIONS.find(item => item.id === qid);
        for (let iter = 0; iter < 10; iter++) {
          try {
            const gen = DYNAMIC_GENERATORS[qid](q);
            checkTextForBadEscapes(gen.questionPrompt || gen.prompt, `dynamic:${qid}:iter${iter}:prompt`);
            checkTextForBadEscapes(gen.formulaHint, `dynamic:${qid}:iter${iter}:formulaHint`);
            checkTextForBadEscapes(gen.fullSolution, `dynamic:${qid}:iter${iter}:fullSolution`);
            if (gen.options) {
              gen.options.forEach((opt, idx) => {
                const txt = typeof opt === "object" ? opt.text : opt;
                checkTextForBadEscapes(txt, `dynamic:${qid}:iter${iter}:opt${idx}`);
              });
            }
          } catch (e) {
            issues.push({ context: `dynamic:${qid}:iter${iter}`, error: "Generator throw: " + e.message });
          }
        }
      });

      document.getElementById("results").textContent = JSON.stringify(issues);
    });
  </script>
</body>
</html>
"""

with open("temp_audit_all.html", "w", encoding="utf-8") as f:
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
    f"http://127.0.0.1:{PORT}/temp_audit_all.html"
]

try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    dom = res.stdout
    start = dom.find('<div id="results">') + len('<div id="results">')
    end = dom.find('</div>', start)
    import html as py_html
    json_str = py_html.unescape(dom[start:end])
    if not json_str.strip():
        print("DOM output snippet:", dom[:500])
        print("End snippet:", dom[-500:])
        data = []
    else:
        data = json.loads(json_str)
    
    with open("all_issues.json", "w", encoding="utf-8") as f_out:
        json.dump(data, f_out, ensure_ascii=False, indent=2)
    print(f"Total issues found: {len(data)}")
    
    # Group by context prefix
    by_context = {}
    for issue in data:
        ctx = issue['context'].split(':')[0] + ":" + issue['context'].split(':')[1]
        by_context.setdefault(ctx, []).append(issue)
        
    for ctx, items in by_context.items():
        print(f"  {ctx}: {len(items)} issues")
        print(f"    sample: {items[0]['error'][:80]}")
finally:
    if os.path.exists("temp_audit_all.html"):
        os.remove("temp_audit_all.html")
    httpd.shutdown()
