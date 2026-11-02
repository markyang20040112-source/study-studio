import os
import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_q_u1_l3_02_math_and_clean_text():
    with open("js/questions.js", "r", encoding="utf-8") as f:
        text = f.read()

    # Locate q-u1-l3-02
    pattern = re.compile(r'id:\s*"q-u1-l3-02".*?fullSolution:\s*"([^"]+)"', re.DOTALL)
    m = pattern.search(text)
    assert m, "q-u1-l3-02 not found in js/questions.js"
    sol = m.group(1)

    # Verify rambling text is removed
    assert "等等" not in sol, "Rambling internal comment found in q-u1-l3-02 fullSolution!"
    assert "核對數列" not in sol, "Draft notes found in q-u1-l3-02 fullSolution!"
    assert "58 - 22 = 36" in sol, "Expected step 58 - 22 = 36 not in fullSolution!"

    # Verify prompt and givenData sequence
    prompt_m = re.search(r'id:\s*"q-u1-l3-02".*?questionPrompt:\s*"([^"]+)"', text, re.DOTALL)
    assert "58" in prompt_m.group(1), "7th item in q-u1-l3-02 prompt must be 58"
    assert "50, 65, 80" not in prompt_m.group(1), "Old erroneous 50 still present in q-u1-l3-02 prompt"

    print("✓ q-u1-l3-02 math, prompt, and clean solution verified.")

def test_numeric_parsing_logic():
    # Emulate the numeric parsing logic implemented in js/app.js submitNumericAnswer
    def parse_user_input(rawVal, correctAnswer, unitLabel="", tolerance=0.05):
        cleanVal = rawVal.replace(",", "").strip()
        hasPercentSign = False
        if cleanVal.endswith("%"):
            hasPercentSign = True
            cleanVal = cleanVal[:-1].strip()

        if "/" in cleanVal:
            parts = cleanVal.split("/")
            if len(parts) == 2:
                num = float(parts[0].strip())
                den = float(parts[1].strip())
                if den != 0:
                    userNum = num / den
                else:
                    return False, "div_zero"
        else:
            userNum = float(cleanVal)

        tol = tolerance
        isCorrect = abs(userNum - correctAnswer) <= tol

        if not isCorrect and unitLabel == "%":
            if correctAnswer > 1 and abs(userNum * 100 - correctAnswer) <= tol:
                isCorrect = True
            elif correctAnswer <= 1 and abs(userNum / 100 - correctAnswer) <= tol:
                isCorrect = True
        elif not isCorrect and hasPercentSign:
            if abs(userNum - correctAnswer) <= tol or abs(userNum / 100 - correctAnswer) <= tol:
                isCorrect = True

        return isCorrect, userNum

    # 1. Comma tests: 1,600 should equal 1600, not 1!
    ok, num = parse_user_input("1,600", 1600)
    assert ok and num == 1600, f"Expected 1600, got {num}"

    ok, num = parse_user_input("8,640", 8640)
    assert ok and num == 8640, f"Expected 8640, got {num}"

    # 2. Percentage inputs:
    # If correctAnswer is 50 (%)
    ok, num = parse_user_input("50%", 50, "%")
    assert ok, "50% should match correctAnswer 50"
    ok, num = parse_user_input("0.5", 50, "%")
    assert ok, "0.5 proportion should match correctAnswer 50 (%)"
    ok, num = parse_user_input("50", 50, "%")
    assert ok, "50 should match correctAnswer 50 (%)"

    # If correctAnswer is 0.70 (proportion)
    ok, num = parse_user_input("0.70", 0.70, "")
    assert ok, "0.70 should match 0.70"
    ok, num = parse_user_input("70%", 0.70, "")
    assert ok, "70% should match 0.70"

    # 3. Fraction inputs:
    ok, num = parse_user_input(" 14 / 15 ", 14/15, "")
    assert ok, "14 / 15 with spaces should match"

    ok, num = parse_user_input("1,600 / 2", 800, "")
    assert ok and num == 800, "1,600 / 2 should match 800"

    # 4. Negative numbers:
    ok, num = parse_user_input("-20", -20, "")
    assert ok and num == -20, "-20 should match -20"

    print("✓ Numeric parsing with commas, fractions, percentages, and proportions verified.")

def test_app_js_hardening():
    with open("js/app.js", "r", encoding="utf-8") as f:
        app_js = f.read()

    # KaTeX retry
    assert "isKaTeXPending" in app_js, "KaTeX retry handler missing"

    # MCQ Option shuffling
    assert "mcqOptionShuffledCache" in app_js, "mcqOptionShuffledCache missing"
    assert "data-key" in app_js, "data-key attribute missing on option buttons"

    # Dynamic question reset
    assert 'status: "unattempted"' in app_js, "randomizeCardParam must reset status to unattempted"
    assert "userAttempts: 0" in app_js, "randomizeCardParam must reset userAttempts to 0"
    assert "const newCard = createQuestionCard(merged, originalQ, indexNum);" in app_js, "randomizeCardParam must use indexNum"

    # Commas stripping in submitNumericAnswer
    assert 'replace(/,/g, "")' in app_js, "submitNumericAnswer must strip commas"

    print("✓ js/app.js hardening verified.")

if __name__ == "__main__":
    test_q_u1_l3_02_math_and_clean_text()
    test_numeric_parsing_logic()
    test_app_js_hardening()
    print("\n🎉 ALL HARDENING INTEGRATION TESTS PASSED!")
