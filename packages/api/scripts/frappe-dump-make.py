import json
from pathlib import Path

with open('frappe-dump-raw.json') as f:
    data = json.load(f)

out = {}

for entry in data:
    if entry['type'] != "table": continue
    out[entry['name']] = entry['data']

Path('frappe-dump.json').write_text(json.dumps(out))
