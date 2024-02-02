import * as p from '@clack/prompts';
import { PrismaClient } from '@prisma/client';
import { glob } from 'glob';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const NEWLINE = '\n';

const here = path.dirname(new URL(import.meta.url).pathname);

const real_table_mapping: { [key: string]: string } = {
  Uploader: 'User',
  Member: 'User',
  Author: 'User',
};

function ask<T>(answer: T | symbol): T {
  if (p.isCancel(answer)) {
    process.exit(1);
  }

  if (!answer && typeof answer !== 'boolean') {
    console.error('Aucune réponse fournie');
    process.exit(1);
  }

  return answer;
}

/**
 * Check if the given files are not modified since latest git commit.
 * @param filepaths file paths to check for, relative to (git root)/packages/api
 * @returns true if all files are git clean
 */
function areFilesGitClean(...filepaths: string[]): boolean {
  const resolvedFilepaths = filepaths.map((f) => path.resolve(path.join(here, '..', f)));
  const repositoryRoot = execSync('git rev-parse --show-toplevel').toString().trim();
  const changedFiles = execSync('git diff --name-only')
    .toString()
    .trim()
    .split('\n')
    .map((f) => path.resolve(path.join(repositoryRoot, f.trim())));
  return !changedFiles.some((f) => resolvedFilepaths.includes(f));
}

function formatDateToYYYYMMDDHH(date: Date) {
  // Use toISOString to get a standardized date string in the format "YYYY-MM-DDTHH:mm:ss.sssZ"
  const isoString = date.toISOString();

  // Use RegExp to extract individual components
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):.*/);

  if (!match) {
    throw new Error('Invalid ISO string format');
  }

  // Extract components from the RegExp match
  const [, year, month, day, hour] = match;

  // Concatenate the components to form the desired format
  const formattedDate = `${year}${month}${day}${hour}`;

  return formattedDate;
}

function tableAndColumn(dotPathedColumn: string): [string, string] {
  const [table, column] = dotPathedColumn.split('.', 2) as [string, string];
  return [table.charAt(0).toUpperCase() + table.slice(1), column];
}

function variableName(table: string, column: string): string {
  return `${table.toLowerCase()}_${column}`;
}

function isDotPathed(column: string): boolean {
  return column.includes('.');
}

function weightedTsvectorExpression(columnPath: string, weight: string): string {
  let columnExpression;
  if (isDotPathed(columnPath)) {
    const [table, column] = tableAndColumn(columnPath);
    columnExpression = variableName(table, column);
  } else {
    columnExpression = `NEW."${columnPath}"`;
  }

  return `setweight(to_tsvector('french', coalesce(${columnExpression}::text, '')), '${weight}')`;
}

function updateFunctionAndTrigger(
  table: string,
  {
    aWeightedColumns = [] as string[],
    bWeightedColumns = [] as string[],
    cWeightedColumns = [] as string[],
    dWeightedColumns = [] as string[],
  },
): string {
  const columnsByWeight: { [key: string]: string } = {
    ...(aWeightedColumns ?? []).reduce((acc, column) => ({ ...acc, [column.trim()]: 'A' }), {}),
    ...(bWeightedColumns ?? []).reduce((acc, column) => ({ ...acc, [column.trim()]: 'B' }), {}),
    ...(cWeightedColumns ?? []).reduce((acc, column) => ({ ...acc, [column.trim()]: 'C' }), {}),
    ...(dWeightedColumns ?? []).reduce((acc, column) => ({ ...acc, [column.trim()]: 'D' }), {}),
  };

  const dotPathedColumns = Object.keys(columnsByWeight).filter((c) => c.includes('.'));

  const dotPathedDeclarations = dotPathedColumns.map(
    (dotPathedColumn) => `${variableName(...tableAndColumn(dotPathedColumn))}: string = '';`,
  );

  const dotPathedDefinitions = dotPathedColumns.map((dotPathedColumn) => {
    const [tab, column] = tableAndColumn(dotPathedColumn);
    const realTab = real_table_mapping[tab] || tab;
    return `${variableName(tab, column)} = (
            SELECT "${column}"
            FROM "${realTab}"
            WHERE "${realTab}"."id" = NEW."${tab.toLowerCase()}Id"
        );`;
  });

  return `
-- ${table}
CREATE OR REPLACE FUNCTION update_${table.toLowerCase()}_search() RETURNS TRIGGER AS $$
DECLARE
    ${NEWLINE}${dotPathedDeclarations.join(NEWLINE)}
BEGIN
    ${NEWLINE}${dotPathedDefinitions.join(NEWLINE)}

    NEW."search" := ${Object.entries(columnsByWeight)
      .map(([column, weight]) => weightedTsvectorExpression(column, weight))
      .join(' || ')};

    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_${table.toLowerCase()}_search_trigger before INSERT OR UPDATE ON "${table}" FOR EACH ROW EXECUTE PROCEDURE update_${table.toLowerCase()}_search();
`;
}

p.intro("Ajout d'une colonne auto-gérée pour la recherche full-text dans PostgreSQL");

if (!areFilesGitClean('prisma/schema.prisma', 'src/lib/fulltextsearch.sql')) {
  p.log.error(
    "Les fichiers packages/api/prisma/schema.prisma et/ou packages/api/src/lib/fulltextsearch.sql ont été modifiés.\nMerci de commit (ou d'annuler les changements) avant de lancer ce script.",
  );
  p.outro('Bye!');
  process.exit(1);
}

const fulltextsearchSQLFilePath = path.join(here, '..', 'src', 'lib', 'fulltextsearch.sql');

const prisma = new PrismaClient();
const prismaRuntimeModel: any = await (prisma as any)._runtimeDataModel;
const tableNames: Array<[symbol, string]> = Object.keys(prismaRuntimeModel.models)
  .sort()
  .map((name) => [Symbol(name), name]);

const tableName = ask(
  await p.select({
    message: 'Table à laquelle ajouter le support',
    options: tableNames.map(([value, label]) => ({ value, label })),
    maxItems: 10,
  }),
)
  .toString()
  .replace(/Symbol\((.*)\)/, '$1')
  .trim();

function mutatePrismaSchema(schemaPath: string, tableName: string) {
  p.log.step(`Ajout du champ tsvector à ${tableName} dans le schéma (${schemaPath})`);
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  let insideModel = false;
  const lines = schema.split('\n');
  let outputLines = [...schema.split('\n')];
  for (const [_i, line] of Object.entries(lines)) {
    const i = Number(_i);
    if (new RegExp(`^model\\s+${tableName}\\s*\\{`).test(line)) {
      insideModel = true;
      continue;
    }
    const nextLine = lines[i + 1]?.trim() ?? '';
    if (insideModel && (nextLine.startsWith('@@') || nextLine.startsWith('}'))) {
      // last line where we can add the field. do it!
      // using the index is fine because we'll only match this once since we do it for one model only.
      outputLines.splice(i, 0, `  // For full-text search`);
      outputLines.splice(
        i + 1,
        0,
        `  search Unsupported("tsvector") @default(dbgenerated("''::tsvector"))`,
      );
      outputLines.splice(i + 2, 0, `  @@index([search], type: Gin)`);
      insideModel = false;
      // show a little preview
      p.log.info(
        [
          ...outputLines.slice(i - 3, i).map((l) => '  ' + l),
          ...outputLines.slice(i, i + 3).map((l) => '\u001b[32m+ ' + l + '\u001b[0m'),
          ...outputLines.slice(i + 3, i + 6).map((l) => '  ' + l),
        ].join('\n'),
      );
    }
  }
  fs.writeFileSync(schemaPath, outputLines.join('\n'));
  execSync(`yarn prisma format`);
}

const columns: string[] = prismaRuntimeModel.models[tableName].fields
  .filter((f: { type: string }) => ['String', 'Int', 'Float'].includes(f.type))
  .map((f: { name: string }) => f.name);

p.note(
  "Chaque colonne est affectée d'un poids,\nqui va de 'A' (le plus fortement pondéré\n, par exemple un prénom pour une recherche de personnes)\n à 'D' (le moins fortement pondéré)",
);
let alreadySelected: string[] = [];
const aWeightedColumns: string[] = ask(
  await p.multiselect({
    message: "Colonnes à pondérer avec le poids 'A' (le plus important)",
    options: columns.map((value) => ({ value, label: value })),
  }),
);
alreadySelected.push(...aWeightedColumns);
const bWeightedColumns: string[] = ask(
  await p.multiselect({
    message: "Colonnes à pondérer avec le poids 'B' (peut être vide)",
    options: columns
      .filter((v) => !alreadySelected.includes(v))
      .map((value) => ({ value, label: value })),
    required: false,
  }),
);
alreadySelected.push(...bWeightedColumns);
const cWeightedColumns: string[] = ask(
  await p.multiselect({
    message: "Colonnes à pondérer avec le poids 'C' (peut être vide)",
    options: columns
      .filter((v) => !alreadySelected.includes(v))
      .map((value) => ({ value, label: value })),
    required: false,
  }),
);
alreadySelected.push(...cWeightedColumns);
const dWeightedColumns: string[] = ask(
  await p.multiselect({
    message: "Colonnes à pondérer avec le poids 'D' (peut être vide)",
    options: columns
      .filter((v) => !alreadySelected.includes(v))
      .map((value) => ({ value, label: value })),
    required: false,
  }),
);

function pascalToSnake(pascalCased: string): string {
  return pascalCased
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

const prismaSchemaPath = path.resolve(path.join(here, '..', 'prisma', 'schema.prisma'));
mutatePrismaSchema(prismaSchemaPath, tableName);

p.log.step('Création de la migration');
let cmd = `yarn prisma migrate dev --create-only --name ${pascalToSnake(tableName)}_add_fulltext_search`;
p.log.info('$ ' + cmd);
execSync(cmd, { stdio: 'inherit' });

// find filepath in here/prisma/migrations/
// that matches (today)*/migration.sql

const migrationFilePathCandidates = await glob(
  path.join(
    here,
    '..',
    'prisma',
    'migrations',
    formatDateToYYYYMMDDHH(new Date()) + '*',
    'migration.sql',
  ),
);

if (migrationFilePathCandidates.length !== 1) {
  p.log.error('Impossible de trouver le fichier de migration créé');
  process.exit(1);
}

const migrationFilePath = migrationFilePathCandidates[0]!;

p.log.step(`Ajout du code SQL dans ${migrationFilePath}`);

const newContent = updateFunctionAndTrigger(
  tableName,
  // Replace the input prompts with actual values or remove them as needed.
  {
    aWeightedColumns,
    bWeightedColumns,
    cWeightedColumns,
    dWeightedColumns,
  },
);
fs.appendFileSync(migrationFilePath, newContent);

p.log.step(`Mise à jour de ${fulltextsearchSQLFilePath}`);
fs.appendFileSync(fulltextsearchSQLFilePath, newContent);

p.log.warn(`Vérifies bien le contenu de ${migrationFilePath}.`);
if (
  ask(
    await p.confirm({
      message: "C'est good?",
      active: 'Yep',
      inactive: 'Nope :/',
    }),
  )
) {
  p.log.step('Lancement de la migration');
  p.log.info('$ yarn prisma migrate dev');
  execSync('yarn prisma migrate dev', { stdio: 'inherit' });
  p.log.success("C'est bon!");
  p.outro(
    "Et voilà! Oublies pas d'ajouter des queries utiles dans l'API, ce serait triste sinon :p",
  );
} else {
  const fullQuotedPath = (f: string) => `"${path.resolve(f)}"`;
  p.log.error('Annulation.');

  p.log.step(`Annulation des changements dans ${fulltextsearchSQLFilePath} et ${prismaSchemaPath}`);
  cmd = `git checkout -- ${fullQuotedPath(fulltextsearchSQLFilePath)} ${fullQuotedPath(prismaSchemaPath)}`;
  p.log.info('$ ' + cmd);
  execSync(cmd, { stdio: 'inherit' });

  p.log.step(`Suppression de la migration`);
  fs.rmSync(migrationFilePath);
  fs.rmdirSync(path.dirname(migrationFilePath));
  p.log.success('Tout les changements on été annulés');
  p.outro('Bye!');

  process.exit(1);
}
