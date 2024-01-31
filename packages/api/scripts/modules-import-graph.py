#!/usr/bin/env python
import re
from operator import le
from pathlib import Path

from networkx import DiGraph, simple_cycles
from networkx.drawing.nx_pydot import write_dot

IGNORE_MODULES = ["global"]

here = Path(__file__).parent

modules_directory = here.parent / "src/modules"

module_import_pattern = re.compile(r"^.*from\s+['\"]#modules/([\w-]+)['\"];?\s*$")

import_graph = DiGraph()


def get_imports(directory: Path):
    imported_modules = set()
    for file in directory.glob("**/*.ts"):
        text = file.read_text()
        for i, line in enumerate(text.splitlines()):
            if (match := module_import_pattern.match(line)) is not None:
                if match.group(1) in IGNORE_MODULES:
                    continue
                print(
                    f"{directory.relative_to(Path.cwd())} imports {match.group(1)} in {file.relative_to(Path.cwd())}:{i+1}"
                )
                imported_modules.add(match.group(1))
    return imported_modules


for module_directory in modules_directory.glob("*"):
    module_name = module_directory.name
    if module_name in IGNORE_MODULES:
        continue
    imports = get_imports(module_directory)
    for imported_module in imports:
        import_graph.add_edge(module_name, imported_module)

write_dot(import_graph, here / "modules-import-graph.dot")

# for cycle in cycles:
#     if f"{cycle[0]} -> {cycle[1]}" in printed_cycles:
#         continue
#     print(f"\033[1;31mCycle detected: {cycle[0]} -> {cycle[1]}\033[0m")
#     printed_cycles.add(f"{cycle[0]} -> {cycle[1]}")

for cycle in simple_cycles(import_graph):
    print(f"\033[1;31mCycle detected: {' -> '.join(cycle)}\033[0m")
