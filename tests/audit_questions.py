import re
import json
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("js/questions.js", "r", encoding="utf-8") as f:
    text = f.read()

# Let's extract RAW_QUESTIONS
# Find where RAW_QUESTIONS is defined
rq_start = text.find("const RAW_QUESTIONS = [")
rq_end = text.find("const DYNAMIC_GENERATORS = {")

# Let's find each question block in RAW_QUESTIONS
q_blocks = re.findall(r'\{\s*id:\s*"([^"]+)",(.*?)\n\s*\},?\n', text[rq_start:rq_end], re.DOTALL)
print(f"Found {len(q_blocks)} questions in RAW_QUESTIONS")

l2plus = []
for qid, body in q_blocks:
    level_m = re.search(r'level:\s*(\d+)', body)
    level = int(level_m.group(1)) if level_m else 1
    if level >= 2:
        type_m = re.search(r'type:\s*"([^"]+)"', body)
        qtype = type_m.group(1) if type_m else "unknown"
        title_m = re.search(r'title:\s*"([^"]+)"', body)
        title = title_m.group(1) if title_m else ""
        unit_m = re.search(r'unit:\s*"([^"]+)"', body)
        unit = unit_m.group(1) if unit_m else ""
        l2plus.append({"id": qid, "level": level, "type": qtype, "title": title, "unit": unit})

print(f"Found {len(l2plus)} Level 2+ questions")

# Check each in DYNAMIC_GENERATORS
gen_block = text[rq_end:]
for q in l2plus:
    has_gen = f'"{q["id"]}":' in gen_block or f"'{q['id']}':" in gen_block
    print(f"[{q['id']}] Unit: {q['unit']}, Level: {q['level']}, Type: {q['type']}, Title: {q['title']}, HasGen: {has_gen}")
