import os
import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_files_exist():
    required_files = [
        "index.html",
        "css/main.css",
        "css/components.css",
        "css/math.css",
        "js/questions.js",
        "js/storage.js",
        "js/app.js",
        "README.md"
    ]
    for rf in required_files:
        assert os.path.exists(rf), f"Missing required file: {rf}"
    print("✓ All required files exist.")

def test_scope_and_rules():
    with open("js/questions.js", "r", encoding="utf-8") as f:
        q_code = f.read()

    # Ch 6.3 Logistic regression must be 100% excluded from actual questions
    # (Allow header disclaimer: "Ch 6.3 羅吉斯迴歸 100% 排除")
    # Verify no question title or prompt contains Logistic
    assert "羅吉斯" not in q_code.replace("Ch 6.3 羅吉斯迴歸 100% 排除", "").replace("6.3 羅吉斯迴歸 100% 排除", ""), "FATAL: '羅吉斯' question found!"

    # Percentile formula must use (n-1)+1
    assert "(n - 1) + 1" in q_code or "(n-1)+1" in q_code or "(n - 1) + 1" in q_code, "Percentile formula must use board standard (n-1)+1"

    # Check 6 units exist
    expected_units = [
        "ch02-descriptive",
        "ch02-similarity",
        "ch03-probability",
        "ch06-regression",
        "ch10-lp",
        "ch13-decision"
    ]
    for u in expected_units:
        assert f'id: "{u}"' in q_code or f"'{u}'" in q_code, f"Missing unit: {u}"
    print("✓ Scope and knowledge base rules verified (Ch 6.3 excluded, percentile board note verified, 6 units present).")

def test_html_and_cdn():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    assert "katex.min.css" in html, "KaTeX CSS missing in index.html"
    assert "katex.min.js" in html, "KaTeX JS missing in index.html"
    assert "auto-render.min.js" in html, "KaTeX auto-render missing in index.html"
    assert 'href="css/main.css"' in html, "css/main.css link missing"
    assert 'href="css/components.css"' in html, "css/components.css link missing"
    assert 'href="css/math.css"' in html, "css/math.css link missing"
    assert 'src="js/questions.js"' in html, "js/questions.js missing"
    assert 'src="js/storage.js"' in html, "js/storage.js missing"
    assert 'src="js/app.js"' in html, "js/app.js missing"
    assert "btnWeaknessMode" in html, "btnWeaknessMode missing"
    assert "btnQuickCram" in html, "btnQuickCram missing"
    assert "btnDashboard" in html, "btnDashboard missing"
    print("✓ index.html structure, KaTeX CDN, scripts, and responsive buttons verified.")

def test_questions_data():
    with open("js/questions.js", "r", encoding="utf-8") as f:
        q_code = f.read()

    # Find all question objects
    q_ids = re.findall(r'id:\s*"([^"]+)"', q_code)
    # Filter out units IDs
    actual_q_ids = [qid for qid in q_ids if qid.startswith("q-")]
    print(f"✓ Found {len(actual_q_ids)} distinct questions in question bank:")
    for qid in actual_q_ids:
        print(f"  - {qid}")
    assert len(actual_q_ids) >= 15, "Question count should cover all units and levels!"

if __name__ == "__main__":
    test_files_exist()
    test_scope_and_rules()
    test_html_and_cdn()
    test_questions_data()
    print("\n🎉 ALL UNIT AND INTEGRATION CHECKS PASSED SUCCESSFULLY!")
