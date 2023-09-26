import { PrismaClient } from '@prisma/client';
import slug from 'slug';

const p = new PrismaClient();

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

async function createMinors(
  major: { id: string; shortName: string },
  yearTier: number,
  minors: Array<{ name: string; shortName: string }>,
) {
  console.log(`* Creating minors for ${yearTier}A ${major.shortName} `);
  await Promise.all(
    minors.map(async ({ name, shortName }) => {
      const minor = await p.minor.create({
        data: {
          name,
          uid: slug(shortName),
          shortName,
          yearTier,
          majors: { connect: { id: major.id } },
        },
      });
      console.info(`\t- Created minor ${minor.uid}`);
    }),
  );
}

const SN = await p.major.upsert({
  where: { uid: 'sdn' },
  update: {},
  create: { name: 'Sciences du Numérique', shortName: 'SN', uid: 'sdn' },
});
const EEEA = await p.major.upsert({
  where: { uid: 'eeea' },
  update: {},
  create: {
    name: 'Électronique, Énergie Électrique et Automatique',
    shortName: '3EA',
    uid: 'eeea',
  },
});
const MFEE = await p.major.upsert({
  where: { uid: 'mfee' },
  update: {},
  create: { name: 'Mécanique, Fluides, Énergétique, Énergétique', shortName: 'MF2E', uid: 'mfee' },
});

const SN_MINORS_2A: { name: string; shortName: string }[] = [
  {
    name: 'Computer Networks',
    shortName: 'Réseaux',
  },
  {
    name: 'Télécommunications',
    shortName: 'Télécoms',
  },
  {
    name: 'Aéseau, Séseau et Réseaux',
    shortName: 'ASR',
  },
  {
    name: 'Image et Multimédia',
    shortName: 'IMM',
  },
  {
    name: 'Systèmes Logiciels',
    shortName: 'Logiciel',
  },
  {
    name: 'HPC et Big Data',
    shortName: 'Big Data',
  },
  {
    name: 'ModIA',
    shortName: 'ModIA',
  },
];

await createMinors(SN, 2, SN_MINORS_2A);

const SN_MINORS_3A: { name: string; shortName: string }[] = [
  {
    name: 'Télécommunications sans fil et objets connectés',
    shortName: 'Télécoms',
  },
  {
    name: 'Systèmes et réseaux embarqués',
    shortName: 'Embarqués',
  },
  {
    name: 'Image et Multimédia',
    shortName: 'IMM',
  },
  {
    name: 'Systèmes Logiciels',
    shortName: 'Logiciel',
  },
  {
    name: 'HPC et Big Data',
    shortName: 'Big Data',
  },
  {
    name: 'ModIA',
    shortName: 'ModIA',
  },
  {
    name: 'TLS-SEC',
    shortName: 'TLS-SEC',
  },
];

await createMinors(SN, 3, SN_MINORS_3A);

const EEEA_MINORS_2A: { name: string; shortName: string }[] = [
  {
    name: 'Électronique numérique',
    shortName: 'EN',
  },
  {
    name: 'Électronique Énerge Électrique et Simulation',
    shortName: '3ES',
  },
  {
    name: 'Énergie',
    shortName: 'NRG',
  },
  {
    name: 'Intégration de Systèmes',
    shortName: 'InSYS',
  },

  {
    name: 'Systèmes Communicants',
    shortName: 'SysCom',
  },
  {
    name: 'Physique Numérique',
    shortName: 'PN',
  },
  {
    name: "IA pour le Traitement de l'Information",
    shortName: 'IATI',
  },
  {
    name: 'Systèmes Automatiques Temps-Réel',
    shortName: 'SATR',
  },
  {
    name: 'Systèmes Électrique du futur',
    shortName: 'SEF',
  },
  {
    name: '7Robot',
    shortName: 'SM',
  },
];

await createMinors(EEEA, 2, EEEA_MINORS_2A);

const EEEA_MINORS_3A: { name: string; shortName: string }[] = [
  {
    name: 'Intégration de Systèmes',
    shortName: 'InSYS',
  },

  {
    name: 'Systèmes Communicants',
    shortName: 'SysCom',
  },
  {
    name: 'Physique Numérique',
    shortName: 'PN',
  },
  {
    name: 'Architectures de commande et informatique pour les systèmes embarqués',
    shortName: 'ACISE',
  },
  {
    name: "Conversion électrique et réseaux d'énergie",
    shortName: 'CERE',
  },
  {
    name: 'Électrodynamique et mécatronique avancée',
    shortName: 'EMA',
  },
  {
    name: "IA pour le Traitement de l'Information",
    shortName: 'IATI',
  },
  {
    name: 'Éco-Énergie',
    shortName: 'EE',
  },
];

await createMinors(EEEA, 3, EEEA_MINORS_3A);

const MFEE_MINORS_2A: { name: string; shortName: string }[] = [
  {
    name: 'Eau et Environnement',
    shortName: 'Eau',
  },
  {
    name: 'Énergie - FEP',
    shortName: 'FEP',
  },
];

await createMinors(MFEE, 2, MFEE_MINORS_2A);

const MFEE_MINORS_3A: { name: string; shortName: string }[] = [
  {
    name: 'Fluides, énergétique et procédés',
    shortName: 'FEP',
  },
  {
    name: "Science de l'eau et de l'environnement",
    shortName: 'Eau',
  },
  {
    name: 'Modélisation et simulation numérique',
    shortName: 'MSN',
  },
];

await createMinors(MFEE, 3, MFEE_MINORS_3A);

type SubjectsMapping = Array<{
  name: string;
  shortName?: string;
  moodle?: string;
  minors?: string[];
  semester?: 1 | 2;
  oldFrappeCodes?: number[] | number;
}>;

const SUBJECTS: Record<
  'MFEE' | 'EEEA' | 'SN',
  {
    '1': Record<'FISE' | 'FISA', SubjectsMapping>;
    '2': Record<'FISE' | 'FISA', SubjectsMapping>;
    '3': SubjectsMapping;
  }
> = {
  MFEE: {
    '1': {
      FISA: [
        'Automatique',
        'Mathématiques',
        'Mécanique des Milieux Continus',
        'Thermodynamique',
        'Signaux et Systèmes',
        'Calcul scientifique et programmation',
        'Mécanique des Fluides - Solutions Exactes',
        'Thermique 1',
        'Mécanique des fluides',
        'Hydraulique',
        'Probabilités',
        'Statistique',
        'Équation différentielles',
        'Calcul Scientifique',
      ].map((m) => ({ name: m })),
      FISE: [
        {
          name: 'Mathématiques 1',
          shortName: 'Maths 1',
        },
        {
          name: 'Informatique / Calcul',
          shortName: 'Info / Calcul',
        },
        {
          name: 'Mécanique des Fluides 1',
          shortName: 'Mécaflu 1',
        },
        {
          name: 'Mécanique des Fluides 2',
          shortName: 'Mécaflu 2',
        },
        {
          name: 'Mécanique 1',
          shortName: 'Méca 1',
        },
        {
          name: 'Mathématiques 2',
          shortName: 'Maths 2',
        },
        {
          name: 'Signal et automatique',
          shortName: 'Signal / Auto',
        },
        {
          name: 'Mécanique des Fluides 3',
          shortName: 'Mécaflu 3',
        },
        {
          name: 'Calcul scientifique 1',
          shortName: 'Calcul scientifique 1',
        },
        {
          name: 'Hydraulique',
          shortName: 'Hydraulique',
        },
      ],
    },
    '2': {
      FISA: [
        'Thermique 2',
        "Maitrise de l'information",
        'Fluides Complexes',
        'Elasticité-Plasticité',
        'Milieux poreux',
        'Ecoulements compressibles',
        'Ecoulements de couches limites',
        'TP Couche Limite',
        'Dynamique des ondes',
        'Mécanique des Fluides Turbulence',
        'TPLD',
        'Mécanique des structures',
        'Transferts en Milieux Naturels',
        'Machines',
      ].map((m) => ({ name: m })),
      FISE: [
        {
          name: 'Mécanique des Fluides 4',
          shortName: 'Mécaflu 4',
        },
        {
          name: 'Mécanique des Fluides 5',
          shortName: 'Mécaflu 5',
        },
        {
          name: 'Mécanique 2',
          shortName: 'Méca 2',
        },
        {
          name: 'Calcul scientifique 2',
          shortName: 'Calcul scientifique 2',
        },
        {
          name: 'Transferts',
          shortName: 'Transferts',
        },
        {
          name: 'Projets expérimentaux TPLD',
          shortName: 'TPLD',
        },
        {
          name: 'Projet numérique',
          shortName: 'Projet numérique',
        },
        {
          name: 'Hydrodynamique et ouvrages',
          shortName: 'Hydrodynamique et ouvrages',
          minors: ['eau'],
        },
        {
          name: 'Transferts en milieux naturels',
          shortName: 'Transferts en milieux naturels',
          minors: ['eau'],
        },
        {
          name: ' Météo, climat, ressources en eau',
          shortName: ' Météo, climat, ressources en eau',
          minors: ['eau'],
        },
        {
          name: 'Aérodynamique',
          shortName: 'Aérodynamique',
          minors: ['fep'],
        },
        {
          name: 'Énergie et procédés',
          shortName: 'Énergie et procédés',
          minors: ['fep'],
        },
        {
          name: 'Systèmes à fluides',
          shortName: 'Systèmes à fluides',
          minors: ['fep'],
        },
      ],
    },
    '3': [
      ...[
        'Énergie et procédés',
        'Modélisation et simulation',
        'Particules en écoulement',
        'Milieux réactifs',
        'Combustion',
      ].map((m) => ({ name: m, minors: ['fep'] })),
      ...[
        'Éco-énergie',
        'Hydrologie avancée',
        'Hydrologie',
        'Écoulement environnementaux',
        'Transport et mélange',
      ].map((m) => ({ name: m, minors: ['eau'] })),
      ...[
        'Méthodes numériques et optimisation',
        'Projets numériques',
        'Aérodynamique',
        'Modélisation physique et propulsion',
        'Éléments de base pour la simulation avancée',
      ].map((m) => ({ name: m, minors: ['msn'] })),
    ],
  },
  SN: {
    '1': {
      FISA: [
        '1-58-Introduction aux Réseaux',
        "1-59-Protocoles de l'Internet",
        '1-60-Méthodologie de la Programmation',
        '1-63-Math',
        '1-61-Probabilités',
        '1-79-Logique, preuve et induction',
        '1-65-Architecture des Ordinateurs',
        '2-69-Réseaux téléphoniques',
        '2-68-Réseaux longue distance',
        '2-71-Concept et Programmation Objet',
        '2-72-Systèmes Centralisés',
        '2-80-Base de données',
        '2-62-Automates',
        '2-64-Théorie des Graphes',
      ].map((m) => ({
        semester: Number.parseFloat(m.split('-')[0]!) as 1 | 2,
        name: m.split('-')[2]!,
        oldFrappeCodes: m.split('-')[1]?.split(' ').map(Number),
      })),
      FISE: [
        {
          name: 'Intégration et applications',
          shortName: 'Intégration',
          oldFrappeCodes: 708,
          semester: 1,
        },
        {
          name: 'Probabilités',
          shortName: 'Probas',
          oldFrappeCodes: 740,
          semester: 1,
        },
        {
          name: 'Programmation Impérative',
          shortName: 'PIM',
          oldFrappeCodes: 710,
          semester: 1,
        },
        {
          name: 'Optimisation',
          shortName: 'Opti',
          oldFrappeCodes: 711,
          semester: 1,
        },
        {
          name: 'Statistiques',
          shortName: 'Stats',
          oldFrappeCodes: 712,
          semester: 1,
        },
        {
          name: 'Traitement du Signal',
          shortName: 'TS',
          oldFrappeCodes: 713,
          semester: 1,
        },
        {
          name: 'Automatique',
          shortName: 'Autom',
          oldFrappeCodes: 714,
          semester: 1,
        },
        {
          name: 'Langage C',
          shortName: 'C',
          oldFrappeCodes: 950,
          semester: 1,
        },
        {
          name: 'Modélisation',
          shortName: 'Modé',
          oldFrappeCodes: 715,
          semester: 1,
        },
        {
          name: 'Architecture des Ordinateurs',
          shortName: 'Archi',
          oldFrappeCodes: 709,
        },
        {
          name: 'Télécommunications',
          shortName: 'Télécom',
          oldFrappeCodes: 716,
          semester: 2,
        },
        {
          name: 'Internet',
          oldFrappeCodes: 717,
          semester: 2,
        },
        {
          name: 'Réseaux Locaux',
          shortName: 'Rézoloco',
          oldFrappeCodes: 717,
          semester: 2,
        },
        {
          name: 'Calcul Scientifique',
          shortName: 'CS',
          semester: 2,
          oldFrappeCodes: 718,
        },
        {
          name: 'Technologie Objet',
          shortName: 'TOB',
          semester: 2,
          oldFrappeCodes: 720,
        },
        {
          name: "Systèmes d'Exploitation Centralisés",
          shortName: 'SEC',
          semester: 2,
          oldFrappeCodes: 721,
        },
      ],
    },
    '2': {
      FISA: [
        '74-S7-Évaluation de Performances Réseaux',
        '75-S7-Réseaux opérés avancés',
        "76-S7-Protocoles Avancés de l'Internet",
        '77-S7-Architecture des Réseaux Locaux',
        '78-S7-Statistiques',
        '81-S7-Systèmes Concurrents',
        '87-S7-Applications internet',
        '1047-S7-Recherche opérationnelle',
        '83-S8-Interconnexion des Systèmes',
        '84-S8-Systèmes de Transition, Model Checking',
        '86-S8-Intergiciels',
        "658-S8-Réseaux d'opérateurs mobiles/sans fil",
        '659-S8-Traduction des langages',
        '660-S8-Sécurité',
        '946-S8-Programmation Fonctionnelle',
        '947-S8-Ingénierie Dirigée par les Modèles',
        '1048-S8-Architecture des Réseaux',
      ].map((m) => {
        const [code, semester, name] = m.split('-') as [string, string, string];
        return {
          semester: semester === 'S8' ? 2 : 1,
          name,
          oldFrappeCodes: Number.parseInt(code!, 10),
        };
      }),
      FISE: [
        '847-S8-TAV (M)',
        '848-S7-Architecture des Ordinateurs (A)',
        '849-S7-Systèmes Concurrents et Communicants (A B L M R)',
        '850-S7-Programmation Fonctionnelle (A B M)',
        '851-S7-Traduction des Langages (A B M)',
        '852-S7-Génie du Logiciel et des Systèmes (B L M)',
        '853-S7-IP (A R T)',
        '854-S7-Couches Physiques (A R T)',
        '855-S7-Internet (A R T)',
        '856-S7-Automates (B L M)',
        '857-S7-Théorie des Graphes (A B M L)',
        '858-S7-Optimisation (B L M)',
        '859-S7-Recherche Opérationnelle (B L M)',
        '860-S7-Programmation Fonctionnelle (L)',
        "861-S8-Architecture des Systèmes d'Exploitation (A)",
        '863-S8-Base de Données (A B L M)',
        '864-S8-Analyse Hilbertienne (B)',
        '865-S8-Contrôle Optimal (B)',
        '866-S8-EDP (B M)',
        '867-S8-Modélisation Géométrique (B M)',
        '868-S8-Systèmes de Transitions (L)',
        '869-S8-Sémantique et Traduction des Langages (L)',
        '870-S8-Programmation Mobile (L M)',
        '871-S8-Apprentissage Profond (L M)',
        '872-S8-Image, Rendu, Modélisation (M)',
      ].map((m) => {
        const [code, semester, nameAndMinors] = m.split('-') as [string, string, string];
        const [name, minorsString] = nameAndMinors.split(' (') as [string, string];
        const minorsCodes = minorsString?.replace(')', '').split(' ') as string[];
        return {
          name,
          minors: minorsCodes.map(
            (code) =>
              ({
                A: 'asr',
                B: 'big-data',
                L: 'logiciel',
                M: 'imm',
                R: 'reseaux',
                T: 'telecoms',
              })[code]!,
          ),
          oldFrappeCodes: Number.parseInt(code!, 10),
          semester: semester === 'S8' ? 2 : 1,
        };
      }),
    },
    '3': [],
  },
  EEEA: {
    '1': {
      FISA: [],
      FISE: [],
    },
    '2': {
      FISA: [],
      FISE: [],
    },
    '3': [],
  },
};

async function createSubjects(
  byYearTier: (typeof SUBJECTS)[keyof typeof SUBJECTS],
  major: { id: string; shortName: string },
) {
  console.log(`* Creating subjects for ${major.shortName} `);
  const subjects = [
    ...byYearTier['3'].map((s) => ({
      ...s,
      yearTier: 3,
    })),
    ...byYearTier['2'].FISA.map((s) => ({
      ...s,
      yearTier: 2,
      forApprentices: true,
    })),
    ...byYearTier['2'].FISE.map((s) => ({
      ...s,
      yearTier: 2,
      forApprentices: false,
    })),
    ...byYearTier['1'].FISA.map((s) => ({
      ...s,
      yearTier: 1,
      forApprentices: true,
    })),
    ...byYearTier['1'].FISE.map((s) => ({
      ...s,
      yearTier: 1,
      forApprentices: false,
    })),
  ];

  const OLD_FRAPPE_MAPPING: Record<string, number[]> = {};

  for (let subject of subjects) {
    subject.shortName = subject.shortName ?? subject.name;
    const oldFrappeCodes = subject.oldFrappeCodes ?? [];
    delete subject.oldFrappeCodes;
    try {
      const { id, uid, minors } = await p.subject.create({
        data: {
          ...subject,
          uid: slug(subject.shortName),
          majors: { connect: { id: major.id } },
          minors: subject.minors
            ? {
                connect: subject.minors.map((m) => ({
                  uid_yearTier: {
                    uid: m,
                    yearTier: subject.yearTier,
                  },
                })),
              }
            : undefined,
        },
        include: { minors: true },
      });
      console.info(
        `\t- Created subject ${uid} (${
          minors.length === 0 ? '*' : minors.map((m) => m.shortName).join(', ')
        })`,
      );
      OLD_FRAPPE_MAPPING[id] = Array.isArray(oldFrappeCodes) ? oldFrappeCodes : [oldFrappeCodes];
    } catch (error) {
      console.error(`\t× Fail while creating ${subject.shortName}`);
      console.error(error);
    }
  }
}

await createSubjects(SUBJECTS.MFEE, MFEE);
await createSubjects(SUBJECTS.EEEA, EEEA);
await createSubjects(SUBJECTS.SN, SN);
