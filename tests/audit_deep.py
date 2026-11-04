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
  <script src="js/storage.js"></script>
</head>
<body>
  <div id="results"></div>
  <script>
    const errors = [];
    const warnings = [];

    // Check all RAW_QUESTIONS
    RAW_QUESTIONS.forEach(q => {
      // 1. Check basic question structure
      if (!q.id) errors.push({ id: "unknown", error: "Missing question ID" });
      if (!q.unit) errors.push({ id: q.id, error: "Missing unit" });
      if (q.level === undefined) errors.push({ id: q.id, error: "Missing level" });
      if (!q.type) errors.push({ id: q.id, error: "Missing type" });
      if (!q.title) errors.push({ id: q.id, error: "Missing title" });
      if (!q.questionPrompt && !q.prompt) errors.push({ id: q.id, error: "Missing questionPrompt" });
      if (!q.fullSolution) errors.push({ id: q.id, error: "Missing fullSolution" });

      // Check MCQ structure
      if (q.type === "mcq") {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push({ id: q.id, error: "MCQ options missing or fewer than 2" });
        } else {
          const keys = q.options.map(o => typeof o === "object" ? o.key : o);
          if (!keys.includes(q.correctAnswer)) {
            errors.push({ id: q.id, error: `MCQ correctAnswer '${q.correctAnswer}' not in options: [${keys.join(',')}]` });
          }
          // Check duplicate keys
          const setKeys = new Set(keys);
          if (setKeys.size !== keys.length) {
            errors.push({ id: q.id, error: `MCQ has duplicate option keys: [${keys.join(',')}]` });
          }
        }
      }

      // Check Numeric structure
      if (q.type === "numeric") {
        if (q.correctAnswer === undefined || q.correctAnswer === null || isNaN(q.correctAnswer)) {
          errors.push({ id: q.id, error: `Numeric correctAnswer is invalid: ${q.correctAnswer}` });
        }
      }

      // Check Generator if exists
      if (typeof DYNAMIC_GENERATORS !== "undefined" && DYNAMIC_GENERATORS[q.id]) {
        for (let iter = 0; iter < 100; iter++) {
          try {
            const gen = DYNAMIC_GENERATORS[q.id](q);
            if (!gen) {
              errors.push({ id: q.id, iter, error: "Generator returned null/undefined" });
              break;
            }
            const merged = { ...q, ...gen };

            if (merged.type === "mcq") {
              if (!Array.isArray(merged.options)) {
                errors.push({ id: q.id, iter, error: "Generated MCQ options is not an array" });
              } else {
                const keys = merged.options.map(o => typeof o === "object" ? o.key : o);
                if (!keys.includes(merged.correctAnswer)) {
                  errors.push({ id: q.id, iter, error: `Generated MCQ correctAnswer '${merged.correctAnswer}' not in options: [${keys.join(',')}]` });
                }
                const setKeys = new Set(keys);
                if (setKeys.size !== keys.length) {
                  errors.push({ id: q.id, iter, error: `Generated MCQ duplicate keys: [${keys.join(',')}]` });
                }
                // Check if option texts are duplicated
                const texts = merged.options.map(o => typeof o === "object" ? o.text : o);
                const setText = new Set(texts);
                if (setText.size !== texts.length) {
                  warnings.push({ id: q.id, iter, warning: `Generated MCQ duplicate option texts: ${JSON.stringify(texts)}` });
                }
              }
            } else if (merged.type === "numeric") {
              if (merged.correctAnswer === undefined || merged.correctAnswer === null || isNaN(merged.correctAnswer)) {
                errors.push({ id: q.id, iter, error: `Generated numeric correctAnswer is invalid: ${merged.correctAnswer}` });
              }
              // Check floating point weirdness
              if (typeof merged.correctAnswer === "number" && !Number.isInteger(merged.correctAnswer)) {
                const str = merged.correctAnswer.toString();
                if (str.length > 10 && (str.includes("0000000") || str.includes("9999999"))) {
                  errors.push({ id: q.id, iter, error: `Floating point precision artifact in correctAnswer: ${merged.correctAnswer}` });
                }
              }
            }

            // Check prompts
            const prompt = merged.questionPrompt || merged.prompt;
            if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
              errors.push({ id: q.id, iter, error: "Empty questionPrompt in generated question" });
            }
            if (!merged.fullSolution || typeof merged.fullSolution !== "string" || merged.fullSolution.trim().length === 0) {
              errors.push({ id: q.id, iter, error: "Empty fullSolution in generated question" });
            }

            // Check if NaN or undefined appears in prompt or solution strings
            if (prompt.includes("NaN") || prompt.includes("undefined")) {
              errors.push({ id: q.id, iter, error: `Prompt contains NaN or undefined: ${prompt}` });
            }
            if (merged.fullSolution.includes("NaN") || merged.fullSolution.includes("undefined")) {
              errors.push({ id: q.id, iter, error: `fullSolution contains NaN or undefined: ${merged.fullSolution}` });
            }
            if (merged.formulaHint && (merged.formulaHint.includes("NaN") || merged.formulaHint.includes("undefined"))) {
              errors.push({ id: q.id, iter, error: `formulaHint contains NaN or undefined: ${merged.formulaHint}` });
            }

          } catch (e) {
            errors.push({ id: q.id, iter, error: `Generator crashed: ${e.message}\n${e.stack}` });
            break;
          }
        }
      }
    });

    document.getElementById("results").textContent = JSON.stringify({ errors, warnings });
  </script>
</body>
</html>
"""

with open("temp_audit_deep.html", "w", encoding="utf-8") as f:
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
    f"http://127.0.0.1:{PORT}/temp_audit_deep.html"
]

res = subprocess.run(cmd, capture_output=True, encoding="utf-8")
import re
match = re.search(r'<div id="results">(.*?)</div>', res.stdout, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    print(f"Errors count: {len(data['errors'])}")
    for err in data['errors']:
        print(f"  ERROR: {err}")
    print(f"Warnings count: {len(data['warnings'])}")
    for w in data['warnings'][:10]:
        print(f"  WARNING: {w}")
else:
    print("Could not find results in DOM. Output:")
    print(res.stdout[:500])

httpd.shutdown()
