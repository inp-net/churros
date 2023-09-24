// Load dump
import { DocumentType, PrismaClient } from '@prisma/client';
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'fs';
import { Convert } from './frappe-types';
import slug from 'slug';
import dichotomid from 'dichotomid';
import path from 'path';
import { SingleBar } from 'cli-progress';

const p = new PrismaClient();

const {
  frappe_annee,
  frappe_commentaire,
  frappe_document,
  frappe_document_tags,
  frappe_documentfichier,
  frappe_filiere,
  frappe_matiere,
  frappe_tag,
  portailuser_portailuser,
  auth_user,
} = Convert.toFrappeTypes(readFileSync('./frappe-dump.json').toString());

const allMajors = await p.major.findMany({ where: { schools: { some: { uid: 'n7' } } } });

// Clear data
let deletionCounts: Record<string, number> = {};
console.info('* Clearing data');
deletionCounts['comment'] = await p.comment.deleteMany({}).then((r) => r.count);
deletionCounts['document'] = await p.document.deleteMany({}).then((r) => r.count);
deletionCounts['subject'] = await p.subject.deleteMany({}).then((r) => r.count);
deletionCounts['minor'] = await p.minor.deleteMany({}).then((r) => r.count);
console.info(
  `- Deleted ${Object.entries(deletionCounts)
    .map(([k, v]) => `${v} ${k}s`)
    .join(', ')}`,
);

function progressbar(objectName: string, total: number): SingleBar {
  console.log('');
  console.log('');
  console.log(`· Creating ${total} ${objectName}`);
  const bar = new SingleBar({
    format: `  {percentage}% {bar} {value} ${objectName} created ({eta_formatted})`,
    hideCursor: true,
  });
  bar.start(total, 0);

  return bar;
}

// Create PPP subjet
if (!(await p.subject.findUnique({ where: { uid: 'ppp' } })))
  await p.subject.create({
    data: {
      name: 'Projet Professionnel Personnel',
      uid: 'ppp',
      minors: {
        create: {
          name: 'CAM',
          uid: 'cam',
          yearTier: 2,
          majors: {
            connect: allMajors.map((m) => ({ id: m.id })),
          },
        },
      },
    },
  });

// Create subjects
let bar = progressbar('subjects', frappe_matiere.length);
for (const { nom, filiere_id } of frappe_matiere) {
  if (nom === 'Projet professionnel personnel') continue;
  const filiere = frappe_filiere.find((f) => f.id === filiere_id)!;
  const filiere_annee = frappe_annee.find((f) => f.id === filiere.annee_id)!;
  const filiereSlug = (filiere: string, annee: string) =>
    slug(`${filiere.trim()} ${annee.trim().replace(/A$/, '')}`, { lower: true });
  // console.info(`* Creating subject ${nom}`)
  const existing = await p.subject.findUnique({ where: { uid: slug(nom) } });
  if (existing) {
    // console.info(`- Subject ${nom} already exists as ${slug(nom)}`)
    bar.increment();
    continue;
  }
  await p.subject.create({
    data: {
      name: nom,
      uid: slug(nom),
      minors: {
        connectOrCreate: {
          where: {
            uid: filiereSlug(filiere.nom, filiere_annee.nom),
          },
          create: {
            name: filiere.nom,
            uid: filiereSlug(filiere.nom, filiere_annee.nom),
            yearTier: Number.parseInt(filiere_annee.nom.replace(/A/, '')),
            majors: { connect: { id: (await p.major.findMany())[0]!.id } },
          },
        },
      },
    },
    include: {
      minors: {
        include: {
          majors: true,
        },
      },
    },
  });
  bar.increment();
}

// Import documents, creating  as needed
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

let documentsResidual: Record<
  string,
  {
    uid: string;
    subjectUid: string;
    subjectId_uid: { subjectId: string; uid: string };
    isSolution: boolean;
    tags: Array<
      (typeof TAG_TO_SUBJECT_AND_IS_SOLUTION)[keyof typeof TAG_TO_SUBJECT_AND_IS_SOLUTION]
    >;
  }
> = {}; // Maps id to { subjectId_uid,  }

bar = progressbar('documents', frappe_document.length);
for (const {
  annee,
  auteur_id,
  creation,
  derniere_modif,
  description,
  matiere_id,
  nom,
  id,
} of frappe_document) {
  // console.info(`* Creating document ${nom} (${frappe_matiere.find(m => m.id === matiere_id)!.nom})`)
  const subject = await p.subject.findUniqueOrThrow({
    where: { uid: slug(frappe_matiere.find((m) => m.id === matiere_id)!.nom) },
    include: { minors: true },
  });
  const author = await p.user.findUnique({
    where: {
      uid: auth_user.find(
        (u) =>
          u.id === portailuser_portailuser.find((pu) => pu.user_ptr_id === auteur_id)!.user_ptr_id,
      )!.username,
    },
  });
  if (
    frappe_document_tags
      .map((dt) => frappe_tag.find((t) => t.id === dt.tag_id))
      .every((t) => t?.ecole_id !== '2')
  ) {
    // console.warn(`- Skipping ${nom} (${subject.uid}) because it has tags from other schools`)
    bar.increment();
    continue;
  }
  const tags = frappe_document_tags
    .filter((dt) => dt.document_id === id)
    .map((dt) => frappe_tag.find((t) => t.id === dt.tag_id))
    .filter(Boolean)
    .map(
      (t) => TAG_TO_SUBJECT_AND_IS_SOLUTION[t!.nom as keyof typeof TAG_TO_SUBJECT_AND_IS_SOLUTION],
    );

  const [type, isSolution] = tags[0] ?? [DocumentType.Miscellaneous, false];

  const uidBase = `${slug(nom)}${annee ? `-${annee}` : ''}`;
  const uidNumber = await dichotomid(
    async (n) =>
      !(await p.document.findUnique({
        where: {
          subjectId_uid: { subjectId: subject.id, uid: `${uidBase}${n ? `-${n}` : ''}` },
        },
      })),
  );
  const uid = `${uidBase}${uidNumber ? `-${uidNumber}` : ''}`;

  documentsResidual[id] = {
    uid,
    subjectId_uid: { subjectId: subject.id, uid },
    subjectUid: subject.uid,
    isSolution,
    tags,
  };

  await p.document.create({
    data: {
      description: description ?? '',
      schoolYear: annee ? Number.parseInt(annee) : 0,
      title: nom,
      type,
      uid,
      createdAt: new Date(creation),
      updatedAt: new Date(derniere_modif),
      uploader: author ? { connect: { id: author.id } } : undefined,
      subject: { connect: { id: subject.id } },
    },
  });

  // console.info(`- Created ${uid} (${subject.uid})`)
  bar.increment();
}

console.info(documentsResidual);

function fileExists(filename: string): boolean {
  try {
    return statSync(filename).isFile();
  } catch {
    return false;
  }
}

async function downloadFile(from: string, dest: string) {
  if (fileExists(dest)) {
    // console.log(`  Logo of ${ldapGroup.cn} already exists, skipping…`);
  } else {
    try {
      mkdirSync(path.dirname(dest), { recursive: true });
      copyFileSync(path.join('.', 'frappe-documents', path.basename(from)), dest);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.error(`  Failed to copy ${from} -> ${dest}:`);
      console.error(error);
    }
  }
}

bar = progressbar('fichiers', frappe_documentfichier.length);
for (const { document_id, fichier, ordre } of frappe_documentfichier) {
  // console.info(`* Creating file ${fichier} (${document_id})`)
  const document = documentsResidual[document_id];
  if (!document) {
    // console.info(`- Skipping ${document_id} because it has no document`)
    bar.increment();
    continue;
  }
  const extension = path.extname(fichier);
  const basename = path.basename(fichier, extension);
  const filePath = `documents/${document.subjectUid}/${document.uid}/${ordre}-${slug(
    basename,
  )}${extension}`;

  await downloadFile(fichier, `../storage/${filePath}`);

  await p.document.update({
    where: {
      subjectId_uid: document.subjectId_uid,
    },
    data: {
      [document.isSolution ? 'solutionPaths' : 'paperPaths']: {
        push: filePath,
      },
    },
  });
  bar.increment();
  // console.info(`- Created ${filePath} (${document.subjectUid})`)
}

bar = progressbar('comments', frappe_commentaire.length);
for (const { auteur_id, creation, derniere_modif, document_id, message } of frappe_commentaire) {
  let author = await p.user.findUnique({
    where: {
      uid: auth_user.find(
        (u) =>
          u.id === portailuser_portailuser.find((pu) => pu.user_ptr_id === auteur_id)!.user_ptr_id,
      )!.username,
    },
  });
  const documentConnection = documentsResidual[document_id];
  if (!documentConnection || !author) {
    bar.increment();
    continue;
  }
  await p.comment.create({
    data: {
      body: message,
      author: { connect: { id: author.id } },
      document: {
        connect: documentConnection,
      },
      createdAt: new Date(creation),
      updatedAt: new Date(derniere_modif),
    },
  });
}

bar.stop();
