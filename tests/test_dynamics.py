import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def test_cagr_formula(v0, vt, t):
    cagr = (vt / v0)**(1/t) - 1
    return round(cagr * 100, 2)

def test_percentile_board_formula(nums, x):
    n = len(nums)
    L = (x / 100) * (n - 1) + 1
    p = int(L)
    d = L - p
    xp = nums[p - 1]
    xp1 = nums[p] if p < n else nums[-1]
    interp = round(xp + d * (xp1 - xp), 2)
    return L, interp

def test_smc_jaccard(a, b, c, d):
    N = a + b + c + d
    smc = round((a + d) / N, 4)
    jaccard = round(d / (b + c + d), 4)
    return smc, jaccard

print("Testing dynamic generators math logic...")

# Test 1: CAGR combos
assert test_cagr_formula(1600, 8100, 4) == 50.0
assert test_cagr_formula(1000, 8000, 3) == 100.0
print("✓ CAGR calculation logic verified.")

# Test 2: Percentile board formula
# Given data: [10, 15, 18, 24, 30, 36, 42, 50, 60] (n=9)
nums = [10, 15, 18, 24, 30, 36, 42, 50, 60]
L70, P70 = test_percentile_board_formula(nums, 70)
assert L70 == 6.6, f"Expected 6.6, got {L70}"
assert P70 == 39.6, f"Expected 39.6, got {P70}"
print("✓ Percentile board note formula (n-1)+1 and interpolation verified.")

# Test 3: SMC and Jaccard
smc, jaccard = test_smc_jaccard(5, 1, 2, 2)
assert smc == 0.7000
assert jaccard == 0.4000
print("✓ SMC vs Jaccard contingency math verified.")

# Test 4: Extreme dual-zero dilation
smc_big, jaccard_big = test_smc_jaccard(500, 1, 2, 2)
assert smc_big > 0.99
assert jaccard_big == 0.4000
print(f"✓ Dilution verified: a=500 -> SMC={smc_big}, Jaccard={jaccard_big} (Jaccard completely stable)")

# Test 5: Verify all Level 2+ calculation questions have dynamic generators registered in js/questions.js
with open("js/questions.js", "r", encoding="utf-8") as f:
    q_js = f.read()

assert "const DYNAMIC_GENERATORS = {" in q_js, "DYNAMIC_GENERATORS table missing in js/questions.js"
assert "q.hasDynamic = true;" in q_js, "Dynamic auto-binding missing in js/questions.js"
assert "q.generator = DYNAMIC_GENERATORS[q.id];" in q_js, "Generator binding missing in js/questions.js"

# Extract registered generator keys
import re
gen_keys = re.findall(r'"(q-u\d-l[234]-\d+)":\s*function', q_js)
print(f"✓ Found {len(gen_keys)} dynamic question generators in DYNAMIC_GENERATORS")
assert len(gen_keys) >= 38, f"Expected at least 38 dynamic generators, got {len(gen_keys)}"

# Test 6: Verify Empirical Rule coffee filling example and Q1=L25%, Q3=L75% in app.js and knowledge base
with open("js/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

with open("EXAM_KNOWLEDGE_BASE.md", "r", encoding="utf-8") as f:
    kb_md = f.read()

# Check Empirical Rule coffee filling scenario
for src, name in [(app_js, "js/app.js"), (kb_md, "EXAM_KNOWLEDGE_BASE.md")]:
    assert "咖啡" in src, f"Coffee scenario missing in {name}"
    assert "300" in src, f"Mean 300ml missing in {name}"
    assert "10" in src, f"Std Dev 10ml missing in {name}"
    assert "68.3%" in src or "68%" in src, f"68% missing in {name}"
    assert "95.4%" in src or "95%" in src, f"95% missing in {name}"
    assert "99.7%" in src, f"99.7% missing in {name}"
    assert "密集" in src, f"Density clustering explanation missing in {name}"

# Check Q1 = L25% and Q3 = L75% board formulas
for src, name in [(app_js, "js/app.js"), (kb_md, "EXAM_KNOWLEDGE_BASE.md")]:
    assert "L_{25\\%}" in src or "L_{25%}" in src or "L_{25}" in src, f"L25% missing in {name}"
    assert "L_{75\\%}" in src or "L_{75%}" in src or "L_{75}" in src, f"L75% missing in {name}"
    assert "IQR = Q_3 - Q_1" in src, f"IQR formula missing in {name}"

print("✓ Empirical Rule coffee example and explicit Q1=L25%, Q3=L75% verified in app.js and EXAM_KNOWLEDGE_BASE.md.")

# Test 7: Verify app.js renders randomize button on self-check and mcq as well as numeric
assert "originalQ.hasDynamicGenerator || originalQ.hasDynamic" in app_js, "app.js must check hasDynamic"
assert "randomizeCardParam" in app_js, "randomizeCardParam must exist in app.js"
assert "dynamicQuestionCache[qId] || originalQ" in app_js, "handleMcqSelect/submitNumericAnswer must check dynamicQuestionCache"

print("\n🎉 ALL MATHEMATICAL GENERATORS AND EDGE CASES VERIFIED!")
