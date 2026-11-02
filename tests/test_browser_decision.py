import sys
import subprocess
import time
import http.server
import socketserver
import threading
import os
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PORT = 8773

class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

httpd = socketserver.TCPServer(("", PORT), SilentHandler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()
time.sleep(1)

test_html = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
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
  <script src="js/app.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      currentUnitId = "ch13-decision";
      currentLevel = 0;
      renderMainContent();
      setDecisionSpotlight("minimax_regret");

      const marker = document.createElement("div");
      marker.id = "test-results";
      const c1 = document.getElementById("regretStep1Card");
      const c2 = document.getElementById("regretStep2Card");
      const banner = document.getElementById("regretTransitionBanner");
      const pNext = document.getElementById("step1NextPrompt");
      const pPrev = document.getElementById("step2PrevPrompt");
      const expBox = document.getElementById("decisionExplanationBox");

      // Test tab switching
      setRegretStepView("step1");
      const step1_c1 = c1.style.display !== "none";
      const step1_c2 = c2.style.display === "none";
      const step1_banner = banner.style.display === "none";
      const step1_pnext = pNext.style.display === "block";
      const step1_exp = expBox.innerHTML.includes("第 1 步：原始收益與情境基準");

      setRegretStepView("step2");
      const step2_c1 = c1.style.display === "none";
      const step2_c2 = c2.style.display !== "none";
      const step2_banner = banner.style.display === "none";
      const step2_pprev = pPrev.style.display === "block";
      const step2_exp = expBox.innerHTML.includes("第 2 步：機會損失矩陣與決策");

      setRegretStepView("all");
      const all_c1 = c1.style.display !== "none";
      const all_c2 = c2.style.display !== "none";
      const all_banner = banner.style.display !== "none";
      const all_pnext = pNext.style.display === "none";
      const all_pprev = pPrev.style.display === "none";
      const all_exp = expBox.innerHTML.includes("最大機會損失最小化");

      marker.setAttribute("data-c1", c1 ? "true" : "false");
      marker.setAttribute("data-c2", c2 ? "true" : "false");
      marker.setAttribute("data-banner", banner ? "true" : "false");
      marker.setAttribute("data-pnext-hidden", pNext && pNext.style.display === "none" ? "true" : "false");
      marker.setAttribute("data-pprev-hidden", pPrev && pPrev.style.display === "none" ? "true" : "false");
      marker.setAttribute("data-exp-len", expBox ? String(expBox.innerHTML.length) : "0");
      marker.setAttribute("data-step1-ok", step1_c1 && step1_c2 && step1_banner && step1_pnext && step1_exp ? "true" : "false");
      marker.setAttribute("data-step2-ok", step2_c1 && step2_c2 && step2_banner && step2_pprev && step2_exp ? "true" : "false");
      marker.setAttribute("data-all-ok", all_c1 && all_c2 && all_banner && all_pnext && all_pprev && all_exp ? "true" : "false");
      document.body.appendChild(marker);
    });
  </script>
</body>
</html>"""

runner_path = "test_runner.html"
with open(runner_path, "w", encoding="utf-8") as f:
    f.write(test_html)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--dump-dom",
    f"http://127.0.0.1:{PORT}/{runner_path}"
]

try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    dom = res.stdout
    assert "data-c1=\"true\"" in dom, "Step 1 card not rendered"
    assert "data-c2=\"true\"" in dom, "Step 2 card not rendered"
    assert "data-banner=\"true\"" in dom, "Transition banner not rendered"
    assert "data-pnext-hidden=\"true\"" in dom, "pNext must be hidden in default all view"
    assert "data-pprev-hidden=\"true\"" in dom, "pPrev must be hidden in default all view"
    assert "各情境最佳獲利基準" in dom, "Benchmark row missing in rendered DOM"
    assert "max(30, 0, 30)" in dom, "Scheme B max breakdown missing in rendered DOM"
    assert "data-step1-ok=\"true\"" in dom, "Step 1 toggle verification failed"
    assert "data-step2-ok=\"true\"" in dom, "Step 2 toggle verification failed"
    assert "data-all-ok=\"true\"" in dom, "All toggle verification failed"
    print("✓ Headless Edge deep browser verification (with step tab switching) passed!")

finally:
    if os.path.exists(runner_path):
        os.remove(runner_path)
    httpd.shutdown()
