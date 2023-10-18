import { copyFile, mkdir, readFile, stat } from 'fs/promises';
import YAML from 'yaml';
import { PrismaClient } from '@prisma/client';
import slug from 'slug';
import dichotomid from 'dichotomid';
import { Convert } from './frappe-types';
import path from 'node:path';
import { DocumentType } from '@prisma/client';

const TAG_TO_SUBJECT_AND_IS_SOLUTION = {
  TD: [DocumentType.Exercises, false],
  'BE Corrigé': [DocumentType.GradedExercises, true],
  TP: [DocumentType.Practical, false],
  'BE Sujet': [DocumentType.GradedExercises, false],
  Examen: [DocumentType.Exam, false],
  Fiche: [DocumentType.Summary, false],
  'TD Corrigé': [DocumentType.Exercises, true],
  'TP Corrigé': [DocumentType.Practical, true],
  'Examen Corrigé': [DocumentType.Exam, true],
  Cours: [DocumentType.CourseNotes, false],
  PowerPoint: [DocumentType.CourseSlides, false],
  'Correction Exam': [DocumentType.Exam, true],
  "Sujet d'annale": [DocumentType.Exam, false],
  'Enoncé TD': [DocumentType.Exercises, false],
  'Fiche révision': [DocumentType.Summary, false],
  'Annale corrigée': [DocumentType.Exam, true],
  'Annale non corrigée': [DocumentType.Exam, false],
  'Sujet DM': [DocumentType.GradedExercises, false],
  'DM corrigé': [DocumentType.GradedExercises, true],
  'Enoncé Exam': [DocumentType.Exam, false],
} as const;

const majors = YAML.parse(await readFile('./new-subjects.yaml', 'utf-8')) as {
  [major: string]: {
    [yearTier: `${number}A`]: {
      [fisaOrFise: string]: {
        [minor: string]: Array<string | Record<string, string>> | Record<string, string>;
      };
    };
  };
};

const APOGEE_TO_OLD_FRAPPE_MAPPING = JSON.parse(
  await readFile('./apogee-to-old-frappe.json', 'utf-8'),
) as Record<string, string[]>;

/* Maps each subject Id to one or more old frappe subject Ids, from which documents should be imported into the new subject */
const OLD_FRAPPE_MAPPING: Map<string, string[]> = new Map();

const p = new PrismaClient();

let deletionCounts: Record<string, number> = {};
console.info('* Clearing data');
deletionCounts['document'] = await p.document.deleteMany({}).then((r) => r.count);
deletionCounts['subject'] = await p.subject.deleteMany({}).then((r) => r.count);
deletionCounts['minor'] = await p.minor.deleteMany({}).then((r) => r.count);
deletionCounts['teaching units'] = await p.teachingUnit.deleteMany({}).then((r) => r.count);
console.info(
  `- Deleted ${Object.entries(deletionCounts)
    .map(([k, v]) => `${v} ${k}s`)
    .join(', ')}`,
);

type ApogeeCode = {
  code: string;
  semester: 5 | 6 | 7 | 8 | 9;
  major: 'EE' | 'AE' | 'EK' | 'AN' | 'EN' | 'EAN' | 'EM';
  unitNumber: number;
  subjectLetter?: string & { length: 1 };
};

const SUBJECT_WORDS_TO_EMOJI = YAML.parse(
  await readFile('./subject-emojis.yaml', 'utf-8'),
) as Record<string, string>;

function inferSubjectEmoji(text: string): string {
  // comparator to get the closest match to the beginning of the string first
  const comparator = ([_, aIndex]: [string, number], [__, bIndex]: [string, number]) =>
    aIndex - bIndex;

  // number is the match position
  const candidates = Object.entries(SUBJECT_WORDS_TO_EMOJI).map(
    ([matchingWords, emoji]) =>
      (
        matchingWords
          .split(',')
          .map((word) => {
            const pattern = new RegExp(`(^|\\b)${word.toLowerCase()}s?(\\b|$)`);
            const match = pattern.exec(text.toLowerCase());
            return [emoji, match?.index];
          })
          .filter(([_, index]) => index !== undefined) as Array<[string, number]>
      ).sort(comparator)[0] ?? ['', undefined],
  ) as Array<[string, number]>;

  return candidates.sort(comparator)[0]?.[0] ?? '';
}

function decodeApogeeCode(code: string): undefined | (ApogeeCode & { isUnit: boolean }) {
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
    semester: Number.parseInt(semester, 10) as ApogeeCode['semester'],
    major: major as ApogeeCode['major'],
    unitNumber: Number.parseInt(unitNumber, 10),
    subjectLetter: subjectLetter as ApogeeCode['subjectLetter'],
    isUnit: !Boolean(subjectLetter),
    code,
  };
}

function toRelativeSemester(semester: undefined | ApogeeCode['semester']): 1 | 2 | undefined {
  if (semester === undefined) return undefined;
  return semester % 2 === 0 ? 2 : 1;
}

for (let [majorShortName, yearTiers] of Object.entries(majors)) {
  let majorUid = slug(majorShortName);
  let longName = majorShortName;
  switch (majorShortName) {
    case '3EA': {
      longName = 'Électronique, Énergie Électrique et Automatique';
      majorUid = 'eeea';
      break;
    }
    case 'SN': {
      longName = 'Sciences du Numériques';
      majorUid = 'sdn';
      break;
    }
    case 'MF2E': {
      longName = 'Mécanique des Fluides, Énergétique et Environnement';
      majorUid = 'mfee';
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
          typeof subject === 'string'
            ? [subject.replace(/\s+@\d+$/, ''), subject]
            : Object.entries(subject)[0]!,
        ) as Array<[string, string]>;

        let units = subjectsCleaned
          .map(([shortNameOrCode, name]) => [decodeApogeeCode(shortNameOrCode), name])
          .filter(
            ([decoded]) => (decoded as undefined | (ApogeeCode & { isUnit: boolean }))?.isUnit,
          )
          .map(([decoded, name]) => ({
            ...(decoded as ApogeeCode & { isUnit: true; subjectLetter: undefined }),
            name: (name as string).replace(/\s+@\d+$/, ''),
          }));

        const unitsapogeeCodesToDatabaseIds: Map<string, string> = new Map();
        for (const unit of units) {
          let existingUnit = await p.teachingUnit.findFirst({
            where: { apogeeCode: unit.code },
          });
          existingUnit = await p.teachingUnit.upsert({
            where: { id: existingUnit?.id ?? '' },
            create: {
              name: unit.name.replace(/^UE\s+/, ''),
              apogeeCode: unit.code,
            },
            update: {},
          });
          unitsapogeeCodesToDatabaseIds.set(unit.code, existingUnit.id);
        }

        for (const [shortNameOrCode, nameWithOldFrappeRefs] of subjectsCleaned) {
          const subjectInfosFromApogeeCode = decodeApogeeCode(shortNameOrCode);
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
            subjectInfosFromApogeeCode?.code &&
            APOGEE_TO_OLD_FRAPPE_MAPPING[subjectInfosFromApogeeCode.code]
          ) {
            oldFrappeRefs = APOGEE_TO_OLD_FRAPPE_MAPPING[subjectInfosFromApogeeCode.code]!;
          }
          if (subjectInfosFromApogeeCode?.isUnit) continue;
          const unit = units.find((unit) => shortNameOrCode.startsWith(unit.code));
          let subjectUid = slug(subjectInfosFromApogeeCode ? name : shortNameOrCode);
          const existingSubject = subjectInfosFromApogeeCode
            ? (await p.subject.findFirst({
                where: {
                  OR: [
                    { apogeeCode: subjectInfosFromApogeeCode.code, yearTier },
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
          const relativeSemester = toRelativeSemester(subjectInfosFromApogeeCode?.semester);

          const subject = await p.subject.upsert({
            where: { id: existingSubject?.id ?? '' },
            create: {
              name,
              shortName: !subjectInfosFromApogeeCode ? shortNameOrCode : undefined,
              yearTier,
              uid: subjectUid,
              forApprentices,
              emoji: inferSubjectEmoji(shortNameOrCode) || inferSubjectEmoji(name),
              apogeeCode: subjectInfosFromApogeeCode?.code,
              minors: minor ? { connect: { id: minor.id } } : undefined,
              majors: minor ? undefined : { connect: { id: major.id } },
              semester: relativeSemester,
              unit: unit
                ? {
                    connect: {
                      id: unitsapogeeCodesToDatabaseIds.get(unit.code) ?? '',
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
            `\t\t\t\t+ Subject${
              subject.emoji || subject.shortName
                ? ` ${[subject.emoji, subject.shortName].join(' ')} `
                : ''
            }"${subject.name}" [${subjectCharacteristics}]`,
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

let {
  frappe_document,
  frappe_document_tags,
  frappe_documentfichier,
  frappe_tag,
  portailuser_portailuser,
  auth_user,
} = Convert.toFrappeTypes(await readFile('./frappe-dump.json', 'utf-8'));

for (const [subjectId, oldSubjectIds] of OLD_FRAPPE_MAPPING.entries()) {
  const subject = await p.subject.findUniqueOrThrow({ where: { id: subjectId } });
  console.log(
    `* Importing documents for subject ${subject.shortName || subject.name} (${subject.yearTier}A ${
      subject.forApprentices ? 'FISA' : 'FISE'
    })`,
  );
  for (const oldSubjectId of oldSubjectIds) {
    console.log(`\t* Importing documents from old subject ${oldSubjectId}`);
    const documents = frappe_document.filter((d) => d.matiere_id === oldSubjectId);
    for (const oldDocument of documents) {
      console.log(`\t\t* Importing document ${oldDocument.nom}`);
      const files = frappe_documentfichier.filter((f) => f.document_id === oldDocument.id);
      let filepaths: string[] = [];
      await Promise.all(
        files.map(async ({ fichier, ordre }) => {
          const extension = path.extname(fichier);
          const basename = path.basename(fichier, extension);
          const filePath = `documents/${
            subject.forApprentices === undefined
              ? 'fisea'
              : subject.forApprentices
              ? 'fisa'
              : 'fise'
          }/${subject.yearTier ?? 'anyone'}/${subject.uid}/${slug(oldDocument.nom)}/${
            parseFloat(ordre) + 1
          }-${basename}${extension}`;
          filepaths.push(filePath);

          await downloadFile(fichier, `../storage/${filePath}`);
          console.info(`\t\t\t+ Copied file ${fichier} to ${filePath}`);
        }),
      );

      const { description, annee, nom, creation, derniere_modif, auteur_id } = oldDocument;

      const author = await p.user.findUnique({
        where: {
          uid: auth_user.find(
            (u) =>
              u.id ===
              portailuser_portailuser.find((pu) => pu.user_ptr_id === auteur_id)!.user_ptr_id,
          )!.username,
        },
      });
      if (
        frappe_document_tags
          .map((dt) => frappe_tag.find((t) => t.id === dt.tag_id))
          .every((t) => t?.ecole_id !== '2')
      ) {
        console.warn(`- Skipping ${nom} (${subject.uid}) because it has tags from other schools`);
        continue;
      }
      const tags = frappe_document_tags
        .filter((dt) => dt.document_id === oldDocument.id)
        .map((dt) => frappe_tag.find((t) => t.id === dt.tag_id))
        .filter(Boolean)
        .map(
          (t) =>
            TAG_TO_SUBJECT_AND_IS_SOLUTION[t!.nom as keyof typeof TAG_TO_SUBJECT_AND_IS_SOLUTION],
        );

      const [type, isSolution] = tags[0] ?? [DocumentType.Miscellaneous, false];

      const uidBase = `${slug(nom)}${annee ? `-${annee}` : ''}`;
      const uidNumber = await dichotomid(
        async (n) =>
          !(await p.document.findUnique({
            where: {
              subjectId_uid: { subjectId: subject.id, uid: `${uidBase}${n > 1 ? `-${n}` : ''}` },
            },
          })),
      );
      const uid = `${uidBase}${uidNumber > 1 ? `-${uidNumber}` : ''}`;

      const document = await p.document.create({
        data: {
          // TODO bbcode to markdown
          description: description ?? '',
          schoolYear: annee ? Number.parseInt(annee) : 0,
          title: nom,
          type,
          uid,
          createdAt: new Date(creation),
          updatedAt: new Date(derniere_modif),
          uploader: author ? { connect: { id: author.id } } : undefined,
          subject: { connect: { id: subject.id } },
          solutionPaths: isSolution ? { set: filepaths } : undefined,
          paperPaths: !isSolution ? { set: filepaths } : undefined,
        },
      });

      console.info(`\t\t+ Created document ${document.title} (${document.uid})`);
    }
  }
}

async function fileExists(filename: string): Promise<boolean> {
  try {
    return await stat(filename).then((s) => s.isFile());
  } catch {
    return false;
  }
}

async function downloadFile(from: string, dest: string) {
  if (await fileExists(dest)) {
    // console.log(`  Logo of ${ldapGroup.cn} already exists, skipping…`);
  } else {
    try {
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(path.join('.', 'frappe-documents', path.basename(from)), dest);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.error(`  Failed to copy ${from} -> ${dest}:`);
      console.error(error);
    }
  }
}
