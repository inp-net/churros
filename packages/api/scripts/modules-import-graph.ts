#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import cli from 'cli';
import * as fs from 'fs';
import { glob } from 'glob';
import { analyzeGraph } from 'graph-cycles';
import * as path from 'path';
import which from 'which';

const hasDotCommand = await which('dot').catch(() => false);
const options = cli.parse({
  exclude: ['e', 'Comma-separated list of modules to exclude from the graph', 'string', ''],
  all: [
    'a',
    'Include all modules in the graph, even if they are not imported by any other module',
    'boolean',
    false,
  ],
  png: [
    '',
    "Generate a PNG image of the graph, using graphviz's dot command" +
      (hasDotCommand ? '' : ' \x1b[1;31m(Warning: dot command not found)\x1b[0m'),
    'boolean',
    false,
  ],
}) as { exclude: string; all: boolean; png?: boolean };

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
          console.log(
            `${path.basename(directory).padEnd(padlength)} imports ${match[1].padEnd(padlength)} in ${path.relative(process.cwd(), filepath)}:${i + 1}`,
          );
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
    ...graph.flatMap(([from, edges]) => edges.map((to) => `    "${from}" -> "${to}";`)),
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

const dotFileContent = generateDotFile(importGraph);
fs.writeFileSync(path.join(here, 'modules-import-graph.dot'), dotFileContent);

const analysis = analyzeGraph(importGraph);
for (const cycle of analysis.cycles) {
  console.log(`\x1b[1;31mCycle detected: ${cycle.join(' -> ')}\x1b[0m`);
}

// check if the dot executable is available

if (options.png) {
  if (!hasDotCommand) {
    console.error(
      'dot command not found, cannot generate PNG image of the dependency graph. Remove the --png flag to not attempt to generate the image.',
    );
    process.exit(0);
  }

  execSync(
    `dot -Tpng ${path.join(here, 'modules-import-graph.dot')} -o ${path.join(here, 'modules-import-graph.png')}`,
  );
  console.info(`Graph generated to ${path.join(here, 'modules-import-graph.png')}`);
}
