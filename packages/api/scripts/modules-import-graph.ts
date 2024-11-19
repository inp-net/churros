#!/usr/bin/env ts-node
import { DotParser } from '@vizdom/vizdom-ts-node';
import cli from 'cli';
import * as fs from 'fs';
import { glob } from 'glob';
import { analyzeGraph } from 'graph-cycles';
import * as path from 'path';

const options = cli.parse({
  exclude: ['e', 'Comma-separated list of modules to exclude from the graph', 'string', ''],
  all: [
    'a',
    'Include all modules in the graph, even if they are not imported by any other module',
    'boolean',
    false,
  ],
  svg: ['', 'Generate a SVG image of the graph', 'boolean', false],
}) as { exclude: string; all: boolean; svg?: boolean };

console.log(options);

const ignoredModules = options.exclude?.split(',') ?? [];

const here = path.resolve(path.dirname(new URL(import.meta.url).pathname));

const modulesDirectory = path.join(here, '..', 'src', 'modules');

const moduleImportPattern = /^.*from\s+['"]#modules\/([\w-]+)['"];?\s*$/;
type ImportGraph = Array<[string, string[]]>;
let importGraph: ImportGraph = [];

const longestModuleNameLength = Math.max(
  ...fs.readdirSync(modulesDirectory).map((name) => name.length),
);

async function getImports(directory: string): Promise<Set<string>> {
  const importedModules = new Set<string>();
  const files = await glob(path.join(directory, '**', '*.ts'));

  for (const filepath of files) {
    if (fs.statSync(filepath).isFile() && filepath.endsWith('.ts')) {
      const text = fs.readFileSync(filepath, 'utf-8');
      const lines = text.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const match = line.match(moduleImportPattern);
        if (match !== null && match[1] !== undefined) {
          if (ignoredModules.includes(match[1])) {
            continue;
          }
          const padlength = longestModuleNameLength + 3;
          if (path.basename(directory) !== match[1]) {
            console.log(
              `${path.basename(directory).padEnd(padlength)} imports ${match[1].padEnd(padlength)} in ${path.relative(process.cwd(), filepath)}:${i + 1}`,
            );
          }
          importedModules.add(match[1]);
        }
      }
    }
  }

  return importedModules;
}

function generateDotFile(graph: ImportGraph): string {
  const dotLines = [
    'strict digraph ImportGraph {',
    ...(options.all ? Array.from(graph).map(([node]) => `    "${node}";`) : []),
    ...graph
      .flatMap(([from, edges]) =>
        // filter removes loops (i.e. imports of #modules/<module> within <module>, which is not a big deal)
        edges.filter((to) => to !== from).map((to) => `    "${from}" -> "${to}";`),
      )
      .sort(),
    '}',
  ];
  return dotLines.join('\n');
}

for (const moduleDirectory of fs.readdirSync(modulesDirectory, { withFileTypes: true })) {
  const moduleName = moduleDirectory.name;
  if (ignoredModules.includes(moduleName)) {
    continue;
  }
  const imports = await getImports(path.join(modulesDirectory, moduleName));
  importGraph.push([moduleName, Array.from(imports)]);
}

importGraph.sort(([a], [b]) => a.localeCompare(b));

const dotFileContent = generateDotFile(importGraph);
fs.writeFileSync(path.join(here, 'modules-import-graph.dot'), dotFileContent);

const analysis = analyzeGraph(importGraph);
for (const cycle of analysis.cycles.filter((cycle) => cycle.length > 1)) {
  console.log(`\x1b[1;31mCycle detected: ${cycle.join(' -> ')}\x1b[0m`);
}

if (options.svg) {
  const output = path.join(here, `modules-import-graph.${options.svg ? 'svg' : 'png'}`);
  const svgContents = new DotParser()
    .parse(dotFileContent)
    .to_directed()
    .layout()
    .to_svg()
    .to_string();
  fs.writeFileSync(output, svgContents);
  console.info(`Graph generated to ${output}`);
}
