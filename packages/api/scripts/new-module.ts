import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'node:path';

async function ask(options: p.TextOptions): Promise<string> {
  const answer = await p.text(options);

  if (p.isCancel(answer)) {
    process.exit(1);
  }

  if (!answer) {
    console.error('Please provide a module name');
    process.exit(1);
  }

  return answer;
}

function kebabToPascal(str: string) {
  return str
    .split('-')
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join('');
}

function kebabToCamel(str: string) {
  const pascal = kebabToPascal(str);
  return pascal[0]!.toLowerCase() + pascal.slice(1);
}

p.intro("Créer un module pour l'API");

let name = process.argv[2] || '';
let displayName = '';

displayName = await ask({
  message: 'Nom du module',
  placeholder:
    "En français, au pluriel, avec des majuscules et des espaces, c'est pour la documentation",
  validate: (value) => (!value ? 'Le nom du module ne peut pas être vide' : void 0),
});

if (!name) {
  name = await ask({
    message: 'Nom du dossier',
    validate: (value) => (!value ? 'Le nom du dossier ne peut pas être vide' : void 0),
  });
}

// Get git repository root
const root = execSync('git rev-parse --show-toplevel').toString().trim();
const cwd = process.cwd();

const singularModuleName = name.replace(/s$/, '');
const typename = kebabToPascal(singularModuleName);
const modulePath = path.join(root, 'packages/api/src/modules', name);
const relativeModulePath = path.relative(cwd, modulePath);

console.log(`+ ${relativeModulePath}/`);
await mkdir(modulePath);
console.log(`+ ${relativeModulePath}/resolvers/`);
await mkdir(path.join(modulePath, 'resolvers'));
await writeFile(
  path.join(modulePath, `resolvers/query.${name}.ts`),
  `
import { builder, prisma } from '#lib';
import { ${typename}Type } from '../index.js';

builder.queryField('${name}', (t) => t.prismaField({
    type: ${typename}Type,
    resolve: async (query) => prisma.${kebabToCamel(singularModuleName)}.findMany({ ...query }),
})
`,
);
console.log(`+ ${relativeModulePath}/types/`);
await mkdir(path.join(modulePath, 'types'));
await writeFile(
  path.join(modulePath, `types/${singularModuleName}.ts`),
  `
import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const ${typename}Type = builder.prismaObject('${typename}', {
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    }),
});
`,
);
console.log(`+ ${relativeModulePath}/README.md`);
await writeFile(
  path.join(modulePath, 'README.md'),
  `# ${displayName}

TODO: Écrire la documentation du module
`,
);

console.log(`$ yarn workspace @centraverse/api barrelize`);
execSync(`yarn workspace @centraverse/api barrelize`);

console.log(`> packages/api/src/schema.ts`);
await writeFile(
  path.join(root, 'packages/api/src/schema.ts'),
  (await readFile(path.join(root, 'packages/api/src/schema.ts')))
    .toString()
    .replace(
      "import '#modules/users';",
      ["import '#modules/users';", `import '#modules/${name}';`].join('\n'),
    ),
);

const open =
  (await p.confirm({
    message: 'Ouvrir le dossier dans VSCode ?',
  })) === true;

if (open) {
  execSync(`code ${path.join(modulePath, 'README.md')}`);
}

p.outro('Et voilà ;)');
