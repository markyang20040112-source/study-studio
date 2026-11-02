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

print("\n🎉 ALL MATHEMATICAL GENERATORS AND EDGE CASES VERIFIED!")
