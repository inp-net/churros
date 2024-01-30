import { PrismaClient } from '@prisma/client';
import { readFile, writeFile } from 'node:fs/promises';

const p = new PrismaClient();

const eeeaSubjects = await p.subject.findMany({
  where: {
    OR: [
      {
        majors: { some: { shortName: '3EA' } },
      },
      {
        minors: { some: { majors: { some: { shortName: '3EA' } } } },
      },
    ],
    documents: {
      some: {},
    },
  },
  include: {
    unit: true,
    minors: true,
    documents: {
      include: {
        _count: true,
      },
    },
  },
});

const COLUMNS = [
  'Année',
  'Parcours',
  'Nom',
  "Lien sur l'ancienne frappe",
  'Code Moodle de la nouvelle matière',
] as const;

const oldSubjects: Array<Record<(typeof COLUMNS)[number], string>> = [];

for (const subject of eeeaSubjects) {
  const frappeCode = subject.unit?.name.split(',')[0]?.trim();
  oldSubjects.push({
    "Lien sur l'ancienne frappe": frappeCode
      ? `https://bde.enseeiht.fr/frappe/matiere/${frappeCode}`
      : '',
    'Année': subject.yearTier?.toString() ?? subject.minors[0]?.yearTier?.toString() ?? 'Inconnue',
    'Nom': subject.name,
    'Parcours': subject.minors.map((minor) => minor.name).join(', '),
    'Code Moodle de la nouvelle matière': '',
  });
}

const newSubjectsNested = JSON.parse(await readFile('new-subjects.json', 'utf-8'));
let newSubjects: Array<{
  'Année': string;
  'Formation': '' | 'FISA' | 'FISE';
  'Parcours': string;
  'Code Moodle': string;
  'Nom': string;
  "Lien(s) sur l'ancienne frappe (commencent par bde.enseeiht.fr/services/frappe/matiere/)": string;
  'Commentaires': string;
}> = [];

// Orignal json is nested like this:
// 3EA: (Année): (FISE|FISA): (Parcours): (Code Moodle): (Nom)
for (const year of Object.keys(newSubjectsNested['3EA'])) {
  for (const formation of Object.keys(newSubjectsNested['3EA'][year])) {
    for (const parcours of Object.keys(newSubjectsNested['3EA'][year][formation])) {
      for (const codeMoodle of Object.keys(newSubjectsNested['3EA'][year][formation][parcours])) {
        if (codeMoodle.length === 6 && codeMoodle.startsWith('N')) continue;
        newSubjects.push({
          'Année': year,
          'Formation': formation === '(*)' ? '' : (formation as 'FISA' | 'FISE'),
          'Parcours': parcours === '(*)' ? '' : parcours,
          'Code Moodle': codeMoodle.startsWith('N') ? codeMoodle : '',
          'Nom': newSubjectsNested['3EA'][year][formation][parcours][codeMoodle],
          "Lien(s) sur l'ancienne frappe (commencent par bde.enseeiht.fr/services/frappe/matiere/)":
            '',
          'Commentaires': '',
        });
      }
    }
  }
}

// Flatten out keys of new subjects

// Write out a CSV file

async function writeCsv(to: string, lines: Array<Record<string, string>>) {
  if (lines.length === 0) throw `No lines to write`;
  const header = Object.keys(lines[0]!).join(',');
  const content =
    header +
    '\n' +
    lines
      .map((line) =>
        Object.keys(line)
          .map((key) => `"${line[key]}"`)
          .join(','),
      )
      .join('\n');

  await writeFile(to, content);
}

// Write out separately each year and FISA/FISE in crowdsource-3ea-migration/<year>-<fisa|fise>.csv

for (const year of ['1A', '2A']) {
  await writeCsv(
    `crowdsource-3ea-migration/${year}-fisa.csv`,
    newSubjects.filter((subject) => subject.Année === year && subject.Formation === 'FISA'),
  );
  await writeCsv(
    `crowdsource-3ea-migration/${year}-fise.csv`,
    newSubjects.filter((subject) => subject.Année === year && subject.Formation === 'FISE'),
  );
}

await writeCsv(
  `crowdsource-3ea-migration/3A.csv`,
  newSubjects.filter((subject) => subject.Année === '3A'),
);
