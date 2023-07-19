#!/usr/bin/env python
from glob import glob
from pathlib import Path
import re

routes = Path(__file__).parent / "packages/app/src/routes"

def switch_category_around(import_path: str, category: str)->str:
    if Path(import_path).stem.endswith(category):
        return import_path.replace(Path(import_path).stem ,category+Path(import_path).stem.replace(category, ''))
    return import_path

def delete_import(import_path: str, *components: list[str])-> bool:
    return Path(import_path).with_suffix('').stem in components

def rewrite_import_line(line: str)->str:
    if re.match(r'^\s*import.+from \'', line):
        original_import_path = re.search(r'from \'(.*)\'', line).group(1)
        import_path = re.sub(r'components/[^/]+/', 'components/', original_import_path)
        if delete_import(import_path, 'InputForm', 'Row', 'FormCard', 'FlexList'):
            return ""
        import_path = switch_category_around(import_path, 'Button')
        import_path = switch_category_around(import_path, 'Input')
        import_path = switch_category_around(import_path, 'Badge')
        import_path = switch_category_around(import_path, 'Card')
        import_path = switch_category_around(import_path, 'Picture')
        import_path = switch_category_around(import_path, 'Loader')

        if import_path != original_import_path:
            return line.replace(original_import_path, import_path)
    return line

print(f"Looking in {routes}")
for page_stem in glob("**/*.svelte", root_dir=routes, recursive=True):
    page = routes / page_stem
    print(f"({page.relative_to(routes)})")
    page.write_text("\n".join([ rewrite_import_line(line) for line in page.read_text().splitlines() ]) )
    
