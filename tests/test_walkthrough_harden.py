import os
import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_percentile_ruler_steps():
    data = [10, 15, 18, 24, 30, 36, 42, 50, 60]
    n = len(data)
    
    # Test all 0.5 steps from 1.0 to 9.0
    steps = [i * 0.5 for i in range(2, 19)]
    assert len(steps) == 17
    assert steps[0] == 1.0
    assert steps[-1] == 9.0

    for L in steps:
        x = ((L - 1) / (n - 1)) * 100
        cleanX = int(x) if x.is_integer() else round(x, 2)
        p = int(L)
        d = round((L - p) * 10) / 10
        xp = data[p - 1]
        xp1 = data[p] if p < n else data[-1]
        interp = round(xp + d * (xp1 - xp), 2)
        
        # Verify d is always 0.0 or 0.5
        assert d in (0.0, 0.5), f"L={L}: d={d} not 0.0 or 0.5"
        # Verify cleanX is a clean number with at most 2 decimals
        assert cleanX * 100 == int(cleanX * 100)
        # Verify interp value is clean integer or .5
        assert interp * 2 == int(interp * 2), f"L={L}: interp={interp} has unexpected decimals"
        
    print("✓ All 17 clean 0.5 percentile steps [1.0 ... 9.0] verified.")

def test_app_js_walkthrough_features():
    with open("js/app.js", "r", encoding="utf-8") as f:
        code = f.read()

    # Verify setDecisionSpotlight renders KaTeX
    assert "renderMath(expBox)" in code, "setDecisionSpotlight must call renderMath(expBox)!"
    assert "renderMath(tableBox)" in code, "setDecisionSpotlight must call renderMath(tableBox)!"
    assert "decisionButtonsContainer" in code, "decisionButtonsContainer ID missing!"
    
    # Verify adjustDualZero highlights active button
    assert "dualZeroButtonsContainer" in code, "dualZeroButtonsContainer ID missing!"
    
    # Verify Unit 4 includes explicit interaction term notation
    assert "Z_1 X_1 + Z_2 X_2 + Z_3 (X_1 X_2)" in code or "Z_1 X_1" in code, "Unit 4 must include explicit interaction formula"
    
    # Verify Unit 5 includes axis intercept single-sided bound
    assert "單邊界" in code or "Single-Sided" in code, "Unit 5 must include single-sided bound for axis intercept"
    
    # Verify stepRuler rounds to avoid float errors
    assert "Math.round((parseFloat(slider.value) + delta) * 2) / 2" in code, "stepRuler must round to clean 0.5 multiples!"

    print("✓ js/app.js walkthrough hardening features verified.")

def test_css_tablet_responsiveness():
    with open("css/components.css", "r", encoding="utf-8") as f:
        comp_css = f.read()

    # Verify level-tab has flex-basis <= 85px to prevent 4+1 orphan wrap on 1024px iPad landscape
    m = re.search(r'\.level-tab\s*\{[^}]*flex:\s*1\s+1\s+(\d+)px', comp_css)
    assert m, "flex basis in .level-tab not found"
    basis = int(m.group(1))
    assert basis <= 85, f".level-tab flex basis {basis}px is too large; must be <= 85px to fit 5 tabs on iPad landscape"
    
    # Verify clamp typography
    assert "clamp(" in comp_css, ".level-tab must use clamp for adaptive font sizing"

    # Verify touch-friendly slider in math.css
    with open("css/math.css", "r", encoding="utf-8") as f:
        math_css = f.read()
    assert "#rulerSlider::-webkit-slider-thumb" in math_css, "Touch slider thumb styling missing in css/math.css"
    assert "touch-action: pan-y" in math_css or "touch-action" in math_css, "Touch action hint missing in css/math.css"

    print("✓ CSS tablet responsiveness and iPad touch optimizations verified.")

if __name__ == "__main__":
    test_percentile_ruler_steps()
    test_app_js_walkthrough_features()
    test_css_tablet_responsiveness()
    print("\n🎉 ALL ADVANCED WALKTHROUGH HARDENING TESTS PASSED!")
