import { readFile } from 'fs/promises';
import YAML from 'yaml';
import { PrismaClient } from '@prisma/client';
import slug from 'slug';
import dichotomid from 'dichotomid';

type NewMajor = {
  name: string;
  shortName: string;
  ldapSchoolUid?: string;
};

type NewSubject = {
  name: string;
  shortName: string;
  yearTier?: number;
  forApprentices: boolean;
  moodleId?: string;
  unit?: {
    name: string;
    shortName: string;
    moodleId?: string;
  };
  majors: [NewMajor];
  minors: Array<{
    name: string;
    shortName: string;
    uid: string;
    majors: [NewMajor];
    yearTier: number;
  }>;
};

const majors = YAML.parse(await readFile('./new-subjects.yaml', 'utf-8')) as {
  [major: string]: {
    [yearTier: `${number}A`]: {
      [fisaOrFise: string]: {
        [minor: string]: Array<string | Record<string, string>> | Record<string, string>;
      };
    };
  };
};

const MOODLE_TO_OLD_FRAPPE_MAPPING = JSON.parse(
  await readFile('./moodle-to-old-frappe.json', 'utf-8'),
) as Record<string, string[]>;

/* Maps each subject Id to one or more old frappe subject Ids, from which documents should be imported into the new subject */
const OLD_FRAPPE_MAPPING: Map<string, string[]> = new Map();

const p = new PrismaClient();

let deletionCounts: Record<string, number> = {};
console.info('* Clearing data');
deletionCounts['comment'] = await p.comment.deleteMany({}).then((r) => r.count);
deletionCounts['document'] = await p.document.deleteMany({}).then((r) => r.count);
deletionCounts['subject'] = await p.subject.deleteMany({}).then((r) => r.count);
deletionCounts['minor'] = await p.minor.deleteMany({}).then((r) => r.count);
deletionCounts['teaching units'] = await p.teachingUnit.deleteMany({}).then((r) => r.count);
console.info(
  `- Deleted ${Object.entries(deletionCounts)
    .map(([k, v]) => `${v} ${k}s`)
    .join(', ')}`,
);

type MoodleCode = {
  code: string;
  semester: 5 | 6 | 7 | 8 | 9;
  major: 'EE' | 'AE' | 'EK' | 'AN' | 'EN' | 'EAN' | 'EM';
  unitNumber: number;
  subjectLetter?: string & { length: 1 };
};

function decodeMoodleCode(code: string): undefined | (MoodleCode & { isUnit: boolean }) {
  const pattern = /N([56789])(EE|AE|EK|AN|EN|EAN|EM)(\d+)([A-Z])?/;
  const match = pattern.exec(code);
  if (!match) {
    return undefined;
  }
  const [_, semester, major, unitNumber, subjectLetter] = match;
  if (!semester || !major || !unitNumber) {
    return undefined;
  }
  return {
    semester: Number.parseInt(semester, 10) as MoodleCode['semester'],
    major: major as MoodleCode['major'],
    unitNumber: Number.parseInt(unitNumber, 10),
    subjectLetter: subjectLetter as MoodleCode['subjectLetter'],
    isUnit: !Boolean(subjectLetter),
    code,
  };
}

function toRelativeSemester(semester: undefined | MoodleCode['semester']): 1 | 2 | undefined {
  if (semester === undefined) return undefined;
  return semester % 2 === 0 ? 2 : 1;
}

for (let [majorShortName, yearTiers] of Object.entries(majors)) {
  let majorUid = slug(majorShortName);
  let longName = majorShortName;
  switch (majorShortName) {
    case '3EA': {
      longName = 'Électronique, Énergie Électrique et Automatique';
      break;
    }
    case 'SN': {
      longName = 'Sciences du Numériques';
      break;
    }
    case 'MF2E': {
      longName = 'Mécanique des Fluides, Énergétique et Environnement';
      break;
    }
  }
  const major = await p.major.upsert({
    where: { uid: majorUid },
    create: {
      name: longName,
      shortName: majorShortName,
      uid: majorUid,
    },
    update: {},
  });
  console.info(`+ Major ${major.shortName} "${major.name}"`);

  for (const [yearTierDisplay, fisaAndFise] of Object.entries(yearTiers)) {
    console.info(`\t* Year ${yearTierDisplay}`);
    const yearTier = Number.parseInt(yearTierDisplay.replace(/A$/, ''), 10);
    for (const [fisaOrFise, minors] of Object.entries(fisaAndFise)) {
      console.info(`\t\t* ${fisaOrFise === '(*)' ? 'Both' : fisaOrFise}`);
      const forApprentices = fisaOrFise === 'FISA';
      for (let [minorShortName, subjects] of Object.entries(minors)) {
        const minorUid = slug(minorShortName);
        if (minorShortName !== '(*)') {
          console.info(
            `\t\t\t\x1b[2m* Making minor ${minorShortName} ${[minorUid, yearTier]}\x1b[0m`,
          );
        }
        const minor =
          minorShortName === '(*)'
            ? undefined
            : await p.minor.upsert({
                where: { uid_yearTier: { uid: minorUid, yearTier } },
                create: {
                  name: minorShortName,
                  uid: minorUid,
                  yearTier,
                  majors: { connect: { id: major.id } },
                  shortName: minorShortName,
                },
                update: {},
              });
        console.info(
          `\t\t\t` + (minor ? `+ Minor ${minor.shortName} "${minor.name}"` : '* All minors'),
        );

        if (!Array.isArray(subjects)) {
          subjects = Object.entries(subjects).map(([shortNameOrCode, name]) => ({
            [shortNameOrCode]: name,
          }));
        }

        const subjectsCleaned = subjects.map((subject) =>
          typeof subject === 'string' ? [subject, subject] : Object.entries(subject)[0]!,
        ) as Array<[string, string]>;

        let units = subjectsCleaned
          .map(([shortNameOrCode, name]) => [decodeMoodleCode(shortNameOrCode), name])
          .filter(
            ([decoded]) => (decoded as undefined | (MoodleCode & { isUnit: boolean }))?.isUnit,
          )
          .map(([decoded, name]) => ({
            ...(decoded as MoodleCode & { isUnit: true; subjectLetter: undefined }),
            name: (name as string).replace(/\s+@\d+$/, ''),
          }));

        const unitsMoodleIdsToDatabaseIds: Map<string, string> = new Map();
        for (const unit of units) {
          let existingUnit = await p.teachingUnit.findFirst({
            where: { moodleId: unit.code },
          });
          existingUnit = await p.teachingUnit.upsert({
            where: { id: existingUnit?.id ?? '' },
            create: {
              name: unit.name.replace(/^UE\s+/, ''),
              moodleId: unit.code,
            },
            update: {},
          });
          unitsMoodleIdsToDatabaseIds.set(unit.code, existingUnit.id);
        }

        for (const [shortNameOrCode, nameWithOldFrappeRefs] of subjectsCleaned) {
          const subjectInfosFromMoodleCode = decodeMoodleCode(shortNameOrCode);
          let name = nameWithOldFrappeRefs;
          let oldFrappeRefs: string[] = [];
          if (/\s+@\d+$/.test(nameWithOldFrappeRefs)) {
            let oldFrappeRefsString = '';
            [name, oldFrappeRefsString] = /^(.+)\s+@((\d|,)+)$/
              .exec(nameWithOldFrappeRefs)!
              .slice(1) as [string, string];
            oldFrappeRefs = oldFrappeRefsString.split(',');
          }
          if (
            subjectInfosFromMoodleCode?.code &&
            MOODLE_TO_OLD_FRAPPE_MAPPING[subjectInfosFromMoodleCode.code]
          ) {
            oldFrappeRefs = MOODLE_TO_OLD_FRAPPE_MAPPING[subjectInfosFromMoodleCode.code]!;
          }
          if (subjectInfosFromMoodleCode?.isUnit) continue;
          const unit = units.find((unit) => shortNameOrCode.startsWith(unit.code));
          let subjectUid = slug(subjectInfosFromMoodleCode ? name : shortNameOrCode);
          const existingSubject = subjectInfosFromMoodleCode
            ? (await p.subject.findFirst({
                where: {
                  OR: [
                    { moodleId: subjectInfosFromMoodleCode.code, yearTier },
                    {
                      uid: subjectUid,
                      yearTier,
                      forApprentices,
                      minors: {
                        every: {
                          uid: majorUid,
                        },
                      },
                    },
                  ],
                },
              })) ?? undefined
            : undefined;

          if (!existingSubject) {
            const uidNumber = await dichotomid(
              async (n) =>
                !(await p.subject.findUnique({
                  where: {
                    uid_yearTier_forApprentices: {
                      uid: n > 1 ? `${subjectUid}-${n}` : subjectUid,
                      yearTier,
                      forApprentices,
                    },
                  },
                })),
            );
            if (uidNumber > 1) {
              console.warn(
                `\t\t\t\t\x1b[33mΔ Subject ${name} already exists, adding number ${uidNumber}\x1b[0m`,
              );
              subjectUid = `${subjectUid}-${uidNumber}`;
            }
          }

          console.log(
            `\t\t\t\t\x1b[2m* ${!existingSubject ? 'Making' : `Editing`} subject ${name} ${[
              subjectUid,
              yearTier,
              forApprentices,
            ]}\x1b[0m`,
          );
          const relativeSemester = toRelativeSemester(subjectInfosFromMoodleCode?.semester);

          const subject = await p.subject.upsert({
            where: { id: existingSubject?.id ?? '' },
            create: {
              name,
              shortName: !subjectInfosFromMoodleCode ? shortNameOrCode : undefined,
              yearTier,
              uid: subjectUid,
              forApprentices,
              moodleId: subjectInfosFromMoodleCode?.code,
              minors: minor ? { connect: { id: minor.id } } : undefined,
              majors: minor ? undefined : { connect: { id: major.id } },
              semester: relativeSemester,
              unit: unit
                ? {
                    connect: {
                      id: unitsMoodleIdsToDatabaseIds.get(unit.code) ?? '',
                    },
                  }
                : undefined,
            },
            update: {
              minors: minor ? { connect: { id: minor.id } } : { set: [] },
              majors: minor ? undefined : { connect: { id: major.id } },
            },
            include: {
              minors: true,
            },
          });

          let subjectCharacteristics = '';
          subjectCharacteristics += subject.yearTier ? `${subject.yearTier}A` : '';
          subjectCharacteristics +=
            subject.forApprentices === undefined ? '' : subject.forApprentices ? ' FISA' : ' FISE';
          subjectCharacteristics += subject.semester === null ? '' : ` S${subject.semester}`;
          subjectCharacteristics +=
            subject.minors.length === 0
              ? ' *'
              : ` ${subject.minors.map((m) => m.shortName).join(', ')}`;

          console.info(
            `\t\t\t\t+ Subject ${subject.shortName} "${subject.name}" [${subjectCharacteristics}]`,
          );

          if (oldFrappeRefs?.length > 0) {
            OLD_FRAPPE_MAPPING.set(subject.id, oldFrappeRefs);
            console.info(
              `\t\t\t\t\x1b[36m> Linking documents from old frappe: ${oldFrappeRefs
                .map((code) => `https://bde.enseeiht.fr/services/frappe/matiere/${code}`)
                .join(' ')}\x1b[0m`,
            );
          }
        }
      }
    }
  }
}

console.info(
  [...new Set([...OLD_FRAPPE_MAPPING.values()].flat())]
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .join(' '),
);
