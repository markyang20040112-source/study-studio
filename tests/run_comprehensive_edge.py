import subprocess
import json
import os
import http.server
import socketserver
import threading
import time

PORT = 8790

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
  <div id="results"></div>
  <script src="js/app.js"></script>
  <script>
    window.addEventListener("DOMContentLoaded", () => {
      const results = {
        totalQuestions: RAW_QUESTIONS.length,
        generatorErrors: [],
        uiErrors: [],
        submissionErrors: []
      };

      // 1. Stress test all generators 50 times
      RAW_QUESTIONS.forEach(q => {
        if (typeof DYNAMIC_GENERATORS !== "undefined" && DYNAMIC_GENERATORS[q.id]) {
          for (let i = 0; i < 50; i++) {
            try {
              const res = DYNAMIC_GENERATORS[q.id](q);
              if (!res) throw new Error("Empty return");
              const merged = { ...q, ...res };
              if (merged.type === "mcq") {
                const keys = merged.options ? merged.options.map(o => typeof o === "object" ? o.key : o) : [];
                if (!keys.includes(merged.correctAnswer)) {
                  throw new Error(`Option keys [${keys.join(",")}] do not contain correctAnswer ${merged.correctAnswer}`);
                }
              } else if (merged.type === "numeric") {
                if (merged.correctAnswer === undefined || merged.correctAnswer === null || isNaN(merged.correctAnswer)) {
                  throw new Error(`Invalid numeric correctAnswer: ${merged.correctAnswer}`);
                }
              }
              if (!merged.questionPrompt && !merged.prompt) {
                throw new Error("Missing question prompt");
              }
              if (!merged.fullSolution) {
                throw new Error("Missing fullSolution");
              }
            } catch (e) {
              results.generatorErrors.push({ id: q.id, run: i, error: e.message });
              break;
            }
          }
        }
      });

      // 2. Test UI rendering and randomizeCardParam on each question
      const l2plus = RAW_QUESTIONS.filter(q => q.level >= 2);
      l2plus.forEach(q => {
        try {
          // Render unit & level
          currentUnitId = q.unit || q.unitId;
          currentLevel = q.level;
          renderMainContent();

          // Check if question card exists
          const card = document.getElementById(`card-${q.id}`);
          if (!card) {
            results.uiErrors.push({ id: q.id, error: `Question card #card-${q.id} not rendered in DOM (unit: ${currentUnitId}, level: ${currentLevel})` });
            return;
          }

          // Check if randomize button exists
          const randBtn = card.querySelector(`button[onclick*="randomizeCardParam('${q.id}'"]`);
          if (!randBtn) {
            results.uiErrors.push({ id: q.id, error: "Randomize button missing on card" });
            return;
          }

          // Trigger randomize
          randomizeCardParam(q.id, q.dynamicType);

          // Test submitting answer
          const dynQ = dynamicQuestionCache[q.id] || q;
          if (dynQ.type === "numeric") {
            const input = document.getElementById(`input-${q.id}`);
            if (!input) throw new Error("Input element missing");
            input.value = String(dynQ.correctAnswer);
            submitNumericAnswer(q.id);
            const state = StudyStorage.getQuestionState(q.id);
            if (state.status !== "mastered") {
              results.submissionErrors.push({ id: q.id, error: `Expected status mastered, got ${state.status}` });
            }
          } else if (dynQ.type === "mcq") {
            handleMcqSelect(q.id, dynQ.correctAnswer);
            const state = StudyStorage.getQuestionState(q.id);
            if (state.status !== "mastered") {
              results.submissionErrors.push({ id: q.id, error: `Expected status mastered for MCQ, got ${state.status}` });
            }
          } else if (dynQ.type === "self-check") {
            // Self check can mark self as mastered
            markSelfCheck(q.id, "mastered");
            const state = StudyStorage.getQuestionState(q.id);
            if (state.status !== "mastered") {
              results.submissionErrors.push({ id: q.id, error: `Expected status mastered for self-check, got ${state.status}` });
            }
          }
        } catch (err) {
          results.uiErrors.push({ id: q.id, error: err.message });
        }
      });

      document.getElementById("results").textContent = JSON.stringify(results);
    });
  </script>
</body>
</html>
"""

with open("temp_test2.html", "w", encoding="utf-8") as f:
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
    f"http://127.0.0.1:{PORT}/temp_test2.html"
]

try:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    dom = res.stdout
    start = dom.find('<div id="results">') + len('<div id="results">')
    end = dom.find('</div>', start)
    json_str = dom[start:end]
    data = json.loads(json_str)
    
    print("Generator Errors:", len(data['generatorErrors']), data['generatorErrors'])
    print("UI Errors:", len(data['uiErrors']), data['uiErrors'])
    print("Submission Errors:", len(data['submissionErrors']), data['submissionErrors'])
finally:
    if os.path.exists("temp_test2.html"):
        os.remove("temp_test2.html")
    httpd.shutdown()
