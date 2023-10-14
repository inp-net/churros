import { PrismaClient, DocumentType } from '@prisma/client';
import slug from 'slug';
import { Convert } from './frappe-types';
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import dichotomid from 'dichotomid';
import path from 'node:path';

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

await createMinors(EEEA, 1, [
  {
    name: 'Électronique Numérique',
    shortName: 'EN',
  },
  {
    name: 'Énergie',
    shortName: 'NRG',
  },
]);

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
    name: 'Systèmes Mécatroniques (7Robot)',
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
        ...['Droit du travail', 'Contexte économique et Management', 'Processus stochastiques'].map(
          (name) => ({ name }),
        ),
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
        "?-66-Organisation et Structure de l'Entreprise",
        '?-67-Droit social',
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
        semester:
          m.split('-')[0]! === '?' ? undefined : (Number.parseFloat(m.split('-')[0]!) as 1 | 2),
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
          oldFrappeCodes: 711,
          semester: 1,
        },
        {
          name: 'Statistiques',
          oldFrappeCodes: 712,
          semester: 1,
        },
        {
          name: 'Mise à niveau: Algèbre',
          oldFrappeCodes: [],
          semester: 1,
        },
        {
          name: 'Mise à niveau: Analyse',
          oldFrappeCodes: [],
          semester: 1,
        },
        {
          name: 'Équation Différentielles Partielles',
          shortName: 'EDP',
          oldFrappeCodes: [],
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
          oldFrappeCodes: 714,
          semester: 1,
        },
        {
          name: 'Langage C',
          oldFrappeCodes: 950,
          semester: 1,
        },
        {
          name: 'Modélisation',
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
          name: 'Analyse de Données',
          oldFrappeCodes: [],
          semester: 2,
        },
        {
          name: 'Apprentissage',
          oldFrappeCodes: [],
          semester: 2,
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
        '848-S7 -- Architecture des Ordinateurs (A)',
        '856-S7 -- Automates (B L M)',
        '854-S7 -- Couches Physiques (A R T)',
        '852-S7 -- Génie du Logiciel et des Systèmes (B L M)',
        '949-S7 -- Intergiciels (A B M)',
        '855-S7 -- Internet (A R T)',
        '853-S7 -- IP (A R T)',
        '858-S7 -- Optimisation (B L M)',
        '850-S7 -- Programmation Fonctionnelle (A B M)',
        '860-S7 -- Programmation Fonctionnelle (L)',
        '859-S7 -- Recherche Opérationnelle (B L M)',
        '990-S7 -- Réseaux de Télécom',
        '987-S7 -- Rézo Loco',
        '849-S7 -- Systèmes Concurrents et Communicants (A B L M R)',
        '857-S7 -- Théorie des Graphes (A B M L)',
        '851-S7 -- Traduction des Langages (A B M)',
        '1078-S8 -- Algèbre Linéaire Creuse (B)',
        '864-S8 -- Analyse Hilbertienne (B)',
        '948-S8 -- Applications Web (A B L M R)',
        '890-S8 -- Apprentissage (R)',
        '871-S8 -- Apprentissage Profond (L M)',
        "861-S8 -- Architecture des Systèmes d'Exploitation (A)",
        '863-S8 -- Base de Données (A B L M)',
        '1051-S8 -- Calculabilité & complexité',
        '865-S8 -- Contrôle Optimal (B)',
        '866-S8 -- EDP (B M)',
        '1054-S8 -- Évalutation de performance (A R)',
        '872-S8 -- Image, Rendu, Modélisation (M)',
        '1058-S8 -- Interconnexion',
        '867-S8 -- Modélisation Géométrique (B M)',
        '1053-S8 -- OpenMP',
        '1079-S8 -- Optimisation 2 (B)',
        '1050-S8 -- Programmation Avancée',
        '870-S8 -- Programmation Mobile (L M)',
        '1055-S8 -- Sécurité (A seulement)',
        '869-S8 -- Sémantique et Traduction des Langages (L)',
        '1080-S8 -- Statistiques 2 (B)',
        '873-S8 -- Systèmes Concurrents (R)',
        '868-S8 -- Systèmes de Transitions (L)',
        '847-S8 -- TAV (M)',
      ].map((m) => {
        const [code, semester, nameAndMinors] = m.replace(' -- ', '-').split('-') as [
          string,
          string,
          string,
        ];
        const [name, minorsString] = nameAndMinors.split(' (', 2) as [string] | [string, string];
        const minorsCodes = minorsString
          ? (minorsString.replace(')', '').split(' ') as string[])
          : [];
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
    '3': [
      // "Regular" SN
      ...[
        '919-Accès aux données multimédia',
        '920-Analyse de contenus multimédias',
        '922-Big Data non structurées',
        '916-Calcul réparti',
        '917-Cloud et Big Data, Machine Learning',
        '931-Communications spatiales et aéronautiques',
        '923-High Performance Scientific Computing',
        '934-Ingénierie des Systèmes Embarqués',
        '1057-L - Langage pour le temps réel',
        '932-Logiciels embarqués',
        '921-M - Problèmes Inverses pour le 3D',
        '933-Méthodes formelles',
        '913-Raffinage et Méthodes formelles',
        "925-Réseaux d'opérateurs",
        '935-Réseaux et Systèmes Temps Réel',
        '929-Réseaux mobiles avancés',
        "924-Réseaux pour l'IoT",
        '914-Systèmes Critiques',
        "915-Systèmes d'information",
        '930-Systèmes de communication terrestres et objets connectés',
        "926-Techniques avancées d'Opérateurs",
        '928-Télécoms avancées',
        '927-Virtualisation',
        "918-Vision et Synthèse d'images, Réalité augmentée",
      ].map((m) => {
        const [code, name] = m.split('-', 2) as [string, string];
        return {
          name: name.replace(/^(L|M) - /, ''),
          minors: name.startsWith('L - ')
            ? ['logiciel']
            : name.startsWith('M - ')
            ? ['imm']
            : SN_MINORS_3A.filter((m) => !['TLS-SEC', 'ModIA'].includes(m.shortName)).map((m) =>
                slug(m.shortName),
              ),
          oldFrappeCodes: Number.parseInt(code!, 10),
        };
      }),
      // TLS-SEC
      ...[
        '491-Rappels assembleur',
        '497-Attaques et sécurisation des couches OSI',
        '504-Attaques matérielles et sécurisation',
        "503-Composants fondamentaux d'une architecture sécurisée",
        '490-Cryptographie',
        '495-Définitions sécurité/safety',
        '506-Intrusion systèmes et réseaux',
        '877-Master Secu',
        '974-Preuves Formelles',
        "501-Protection des systèmes d'exploitation",
        '493-Rappels langage C',
        '492-Rappels réseaux',
        "494-Rappels système d'exploitation",
        '508-Reverse engineering',
        '502-Sécurisation des protocoles',
        "507-Sécurité dans l'aérospatiale",
        '498-Sécurité des réseaux non filiaires',
        '876-SHS-Conférences',
        '500-Virus et techniques virales',
        '893-Vulnérabilité Web',
        '499-Vulnérabilités logicielles',
      ].map((m) => {
        const [code, name] = m.split('-', 2) as [string, string];
        return {
          name,
          oldFrappeCodes: Number.parseInt(code!, 10),
          minors: ['tls-sec'],
        };
      }),
    ],
  },
  EEEA: {
    '1': {
      FISA: [
        {
          name: 'Matlab Simulink',
          oldFrappeCodes: 899,
          semester: 1,
        },
      ],
      FISE: [
        '823-HABILITATION ELECTRIQUE',
        '802-S1 - Algorithmique et programmation impérative',
        '799-S1 - Approche théoq de la logique combinatoire et séquentielle',
        '803-S1 - Architecture et programmation en assembleur',
        "800-S1 - Conception d'unités logiques séquentielles et combinatoires",
        '795-S1 - Electromagnétisme',
        '801-S1 - Fonctions logiques et technologie',
        '806-S1 - Intégration',
        "796-S1 - Méthodes d'analyse des circuits électriques",
        '797-S1 - Métrologie et circuits de puissance',
        '794-S1 - Physique des matériaux',
        '804-S1 - Probabilités',
        '824-S1 - Propagation dans les lignes',
        '798-S1 - TP Circuits (Courants faibles/forts)',
        '805-S1 - Variable complexe',
        '811-S2 - Amplificateur opérationnel et compensation',
        '821-S2 - Automatique des systèmes linéaires continus',
        '809-S2 - Calcul Différentiel & Optimisation',
        '814-S2 - Circuits magnétiques & modélisation réluctance (GEA)',
        '817-S2 - Introduction à la conversion statique (GEA)',
        '812-S2 - Modélisation par analogies physiques & analyse',
        '818-S2 - Montages amplificateurs à transistors (EN)',
        '813-S2 - Montages amplificateurs avancés (EN)',
        '815-S2 - Physique du semiconducteur et jonction PN',
        '822-S2 - Projet Objets connectés (EN)',
        '810-S2 - Projet Avion plus électrique (GEA)',
        "807-S2 - Résolution EDP par différences finies et algorithmes d'EDO",
        '791-S2 - Statistiques',
        '820-S2 - Traitement du signal',
        '819-S2 - Traitement numérique du signal',
        '816-S2 - Transistors de signal et composants de puissance',
        // EN
        '31-Analyse de Fourier (EN)',
        '46-Antennes (EN)',
        '583-Approche théorique de la logique combinatoire (EN)',
        '584-Circuits Passifs Idéaux (EN)',
        '585-Contrôle et Analyse des Systèmes Linéaires (EN)',
        '35-Électromagnétisme (EN)',
        '43-Électronique linéaire (EN)',
        '294-Électronique numérique (EN)',
        '45-Filtrage analogique (EN)',
        "44-Fonctions de l'électronique (EN)",
        '586-Gestion Comptable et Financière (EN)',
        "47-Ingénierie micro-ondes en guides d'ondes (EN)",
        '38-Jonctions PN et ses applications (EN)',
        '36-Lignes de transmission (EN)',
        '587-Matlab (EN)',
        "579-Méthodes d'analyse des circuits (EN)",
        '588-Mini-Projet (EN)',
        '580-Modélisation Composants (EN)',
        '32-Modélisation mathématique du hasard (EN)',
        '42-Optimisation (EN)',
        '581-Ouverture Scientifique et Culturelle (EN)',
        '37-Physique des semi-conducteurs (EN)',
        '582-Programmation et C (EN)',
        '664-Projet Professionnel Personnel (EN)',
        '589-Projet Traitement du Signal (EN)',
        "590-Technologies et fonctions de l'électronique numérique (EN)",
        '48-Traitement du signal — Signaux déterministes (EN)',
        '49-Traitement numérique du signal (EN)',
        '40-Transistors bipolaires (EN)',
        '39-Transistors MOS (EN)',
        '41-Variables complexes (EN)',
        // GEA
        '552-Approche lagrangienne (GEA)',
        '199-Circuit et Signaux (GEA)',
        "468-Composants de l'EnP (GEA)",
        '467-CVS (GEA)',
        '747-EDP (GEA)',
        '210-Électrodynamique1 (GEA)',
        '473-Électrodynamique2 (GEA)',
        '231-Énergies et réseaux électriques (GEA)',
        '207-Fonctions Logiques (GEA)',
        '464-Gestion (GEA)',
        "213-Informatique pour l'ingénieur (GEA)",
        '466-Intégration_Fourier (GEA)',
        '749-Machine 2 (GEA)',
        '471-Machine1 (GEA)',
        "748-Méthode d'analyse numérique (GEA)",
        '551-Milieux et interaction magnétique (GEA)',
        "229-Procédés de conversion d'énergie électromécanique (GEA)",
        '209-Propriétés fondamentales de la cellule de commutation (GEA)',
        '469-SLC1 (GEA)',
        '470-SLC2 (GEA)',
        '232-Structure et exploitation des calculateurs (GEA)',
        '465-Variables complexes (GEA)',
      ].map((m) => {
        let [code, ...nameAndSemester] = m.split('-', 3).map((c) => c.trim()) as
          | [string, string]
          | [string, string, string];
        let name = nameAndSemester[0];
        let semester: 1 | 2 | undefined = undefined;
        if (nameAndSemester.length === 2) {
          semester = nameAndSemester[0]! === 'S2' ? 2 : 1;
          name = nameAndSemester[1]!;
        }
        let minor = undefined;
        if (/.+ \([A-Z]+\)$/.test(name)) {
          const [n, min] = name.split(' (', 2) as [string, string];
          name = n;
          minor = min.replace(')', '').toLowerCase();
          if (minor === 'gea') minor = 'nrg';
        }

        return {
          name,
          oldFrappeCodes: Number.parseInt(code!, 10),
          semester,
          minors: minor ? [minor.toLowerCase()] : undefined,
        };
      }),
    },
    '2': {
      FISA: [],
      FISE: [
        // EN
        ...[
          '637-Analyse Numérique',
          '52-Antenne 2',
          "785-Chaine d'instrumentation",
          '53-Circuit Actifs RF',
          "56-Classe d'amplification",
          '548-Électronique Numérique',
          '50-Fourier 2',
          '640-Management',
          '784-Microprocesseurs',
          '792-Optoélectronique',
          '57-Oscillateurs et PLL',
          '641-Programmation Orientée Objet C++',
          '642-Projet Analogique',
          '643-Sport',
          '644-TP ADS',
          '645-TP Numérique',
          '54-Traitement du signal — Signaux aléatoires',
          '55-Traitement numérique du signal',
          '646-VHDL',
        ].map((m) => {
          const [code, name] = m.split('-', 2).map((c) => c.trim()) as [string, string];
          return {
            name,
            oldFrappeCodes: Number.parseInt(code!, 10),
            minors: ['en'],
          };
        }),
        // IATI
        ...[
          '1059-S8 - Algèbre linéaire avancée',
          '1060-S8 - Analyse hilbertienne',
          '1070-S8 - Analyse multivariée',
          '1062-S8 - Conception synchrone des systèmes numériques',
          '1076-S8 - Cours introduction IA et cognition',
          '1064-S8 - DSP',
          '1069-S8 - Filtrage optimal',
          '1073-S8 - Introduction au deep learning',
          '1077-S8 - Logique des propositions et des prédicats',
          '1067-S8 - Modélisation',
          '1061-S8 - Optimisation sous contraintes',
          '1071-S8 - Problèmes inverses',
          '1066-S8 - Projet image',
          '1068-S8 - Représentation et analyse des signaux',
          '1074-S8 - Statistique - méthodes avancées',
          '1075-S8 - Statistiques computationnelles',
          '1063-S8 - Technologie FPGA',
          "1072-S8 - Théorie de l'information",
          "1065-S8 - Traitement de l'image",
        ].map((m) => {
          const [code, semester, name] = m.split('-', 3).map((c) => c.trim()) as [
            string,
            string,
            string,
          ];
          return {
            name,
            oldFrappeCodes: Number.parseInt(code!, 10),
            semester: semester === 'S8' ? 2 : 1,
            minors: ['iati'],
          };
        }),
        // PN
        ...[
          '1024-Algèbre linéaire avancée',
          '1025-Analyse hilbertienne',
          '1023-Analyse physique de structures guidantes',
          "1020-Complément d'analyse numérique",
          "1014-Conception optimale d'un actionneur pour tuyère de fusée",
          "1026-Eléments finis pour l'électromagnétisme",
          '1018-Matériaux',
          '1015-Modélisation des systèmes électromagnétiques par calcul',
          '1016-Modélisations analytiques alternatives du champ',
          '1021-Optimisation',
          '1013-Optimisation et conception optimale des systèmes',
          '1027-Programmation pour le calcul scientifique',
          '1022-Rayonnement électromagnétique et antennes',
          '1019-Simulation numérique en optique',
          '1017-Thermique et mécanique des fluides',
        ].map((m) => {
          const [code, name] = m.split('-', 2).map((c) => c.trim()) as [string, string];
          return {
            name,
            oldFrappeCodes: Number.parseInt(code!, 10),
            minors: ['pn'],
          };
        }),
        // Autres (ex-GEA)
        ...[
          '268-AII _ Automatique et systèmes AII',
          '266-AII _ Développement logiciel de systèmes temps réel',
          '267-AII _ Traitement du signal et identification',
          '483-Association CVS - Machine',
          '479-Automatisme',
          '485-Commande discrète polynomiale',
          '474-CVS',
          '265-EnP _ Automatique et systèmes EnP',
          '263-EnP _ Mise en oeuvre des cellules de commutations',
          '264-EnP _ Systèmes et réseaux électriques',
          "484-Espace d'état",
          '253-Machines 2',
          '540-Mecatronique',
          '482-MLI',
          '480-Optimisation',
          '478-POO',
          '481-Proba_Stat',
          '475-SLC3',
          '477-SLE',
          '476-SNL',
        ].map((m) => {
          const [code, name] = m.split('-', 2).map((c) => c.trim()) as [string, string];
          return {
            name,
            oldFrappeCodes: Number.parseInt(code!, 10),
          };
        }),
      ],
    },
    '3': [
      // PN
      ...[
        '1032-Analyse électromagnétique de la diffraction',
        '1039-Calcul Haute Performance',
        "1037-CEM pour l'aéronautique 1",
        '1044-Commande optimale',
        '1038-Compatibilité électromagnétique',
        '1031-Équipement radar',
        '1041-Incertitudes en CEM',
        '1036-Introduction à la magnétohydrodynamique',
        '1030-Méthodes numériques en électromagnétisme',
        '1040-Méthodes variationnelles pour les EDP de la physique',
        '1035-Modélisation des phénomènes couplés',
        '1043-Modélisation numérique par éléments finis',
        '1042-Optimisation topologique',
        '1034-Phénomènes avancés en conversion électromécanique',
        '1033-Physique des plasmas',
        '1045-Volumes finis',
      ].map((m) => {
        const [code, name] = m.split('-', 2).map((c) => c.trim()) as [string, string];
        return {
          name,
          oldFrappeCodes: Number.parseInt(code!, 10),
          minors: ['pn'],
        };
      }),
    ],
  },
};

const OLD_FRAPPE_MAPPING: Record<string, number[]> = {};
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

  for (const subject of subjects) {
    const shortName = subject.shortName || subject.name;
    const oldFrappeCodes = subject.oldFrappeCodes ?? [];
    delete subject.oldFrappeCodes;
    try {
      const { id, uid, minors } = await p.subject.create({
        data: {
          ...subject,
          unit: {
            create: {
              name: Array.isArray(oldFrappeCodes)
                ? oldFrappeCodes.join(',')
                : oldFrappeCodes.toString(),
            },
          },
          uid: slug(shortName),
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
      const triplet = {
        uid: slug(subject.shortName || subject.name || ''),
        yearTier: subject.yearTier,
        forApprentices: (subject as typeof subject & { forApprentices?: boolean }).forApprentices,
      };

      const duplicates = await p.subject.findMany({
        where: {
          ...triplet,
        },
        select: {
          name: true,
          id: true,
          uid: true,
          shortName: true,
          yearTier: true,
          forApprentices: true,
          semester: true,
          majors: {
            select: {
              uid: true,
            },
          },
          minors: {
            select: { uid: true },
          },
        },
      });

      if (duplicates.length > 0) {
        const { id, name, minors } = duplicates[0]!;
        console.warn(
          `\t! Subject ${JSON.stringify(
            Object.values(triplet),
          )} already exists; adding another old frappe subject (${JSON.stringify(
            oldFrappeCodes,
          )}) to this subject (${name}, #${id})`,
        );
        if ((subject.minors ?? []).length === 0 || minors.length === 0) {
          console.log('\t\tSetting to all minors');
          await p.subject.update({
            where: { id },
            data: {
              minors: { set: [] },
            },
          });
        } else {
          const mergedMinorUids = [
            ...new Set(...[...subject.minors!, ...minors.map((m) => m.uid)]),
          ];
          const allMinorsWithinMajor =
            new Set(
              ...(
                await p.minor.findMany({
                  where: { uid: { in: mergedMinorUids } },
                  include: { majors: true },
                })
              ).flatMap((m) => m.majors.map((m) => m.uid)),
            ).size === 1;
          if (allMinorsWithinMajor) {
            console.log(`\t\tMerging minors to ${JSON.stringify(mergedMinorUids)}`);
            await p.subject.update({
              where: { id },
              data: {
                minors: {
                  set: [
                    ...subject.minors!.map((uid) => ({
                      uid_yearTier: { uid, yearTier: subject.yearTier },
                    })),
                    ...minors.map(({ uid }) => ({
                      uid_yearTier: { uid, yearTier: subject.yearTier },
                    })),
                  ],
                },
              },
            });
          } else {
            console.log('\t\tAdding major to minor uid');
            await p.subject.create({
              data: {
                ...subject,
                uid: slug(`${shortName}-${major.shortName}`),
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
          }
        }
        if (id in OLD_FRAPPE_MAPPING) {
          OLD_FRAPPE_MAPPING[id]!.push(
            ...(Array.isArray(oldFrappeCodes) ? oldFrappeCodes : [oldFrappeCodes]),
          );
        } else {
          OLD_FRAPPE_MAPPING[id] = Array.isArray(oldFrappeCodes)
            ? oldFrappeCodes
            : [oldFrappeCodes];
        }
        continue;
      }

      console.error(
        `\t× Fail while creating ${subject.shortName} on minors ${
          subject.minors ?? []
        } ${JSON.stringify(triplet)}`,
      );
      console.info(`Duplicates: ${JSON.stringify(duplicates, undefined, 2)}`);
      console.error(error);
    }
  }
}

await createSubjects(SUBJECTS.MFEE, MFEE);
await createSubjects(SUBJECTS.EEEA, EEEA);
await createSubjects(SUBJECTS.SN, SN);
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

const NOTFOUND_SUBJECT_OLD_IDS = new Set<number>();

let {
  frappe_document,
  frappe_document_tags,
  frappe_documentfichier,
  frappe_matiere,
  frappe_annee,
  frappe_filiere,
  frappe_tag,
  portailuser_portailuser,
  auth_user,
} = Convert.toFrappeTypes(readFileSync('./frappe-dump.json').toString());

// Remove non-n7 subjects
frappe_matiere = frappe_matiere.filter((matiere) => {
  const filiere = frappe_filiere.find((f) => f.id === matiere.filiere_id)!;
  const annee = frappe_annee.find((a) => a.id === filiere.annee_id)!;
  return annee.ecole_id === '2';
});

// Remove non-n7 majors
frappe_filiere = frappe_filiere.filter((filiere) => {
  const annee = frappe_annee.find((a) => a.id === filiere.annee_id)!;
  return annee.ecole_id === '2';
});

// Remove non-n7 documents
frappe_document = frappe_document.filter((document) =>
  frappe_matiere.some((matiere) => matiere.id === document.matiere_id),
);

let documentsResidual: Record<
  string,
  {
    uid: string;
    subjectUid: string;
    subjectFISA: boolean | undefined;
    subjectYearTier: number | undefined;
    subjectId_uid: { subjectId: string; uid: string };
    isSolution: boolean;
    tags: Array<
      (typeof TAG_TO_SUBJECT_AND_IS_SOLUTION)[keyof typeof TAG_TO_SUBJECT_AND_IS_SOLUTION]
    >;
  }
> = {}; // Maps id to { subjectId_uid,  }
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
  console.info(
    `* Creating document ${nom} (${frappe_matiere.find((m) => m.id === matiere_id)!.nom})`,
  );
  const subjectId = Object.entries(OLD_FRAPPE_MAPPING).find(([_, oldIDs]) =>
    oldIDs.includes(Number.parseInt(matiere_id, 10)),
  )?.[0];
  if (!subjectId) {
    console.error(`\t! No corresponding subject for matiere_id=${matiere_id} found. Skipping.`);
    NOTFOUND_SUBJECT_OLD_IDS.add(Number.parseInt(matiere_id, 10));
    continue;
  }
  const subject = await p.subject.findUniqueOrThrow({
    where: {
      id: subjectId,
    },
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
    console.warn(`- Skipping ${nom} (${subject.uid}) because it has tags from other schools`);
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
    subjectFISA: subject.forApprentices,
    subjectYearTier: subject.yearTier ?? undefined,
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

  console.info(`- Created ${uid} (${subject.uid})`);
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

for (const { document_id, fichier, ordre } of frappe_documentfichier) {
  console.info(`* Creating file ${fichier} (${document_id})`);
  const document = documentsResidual[document_id];
  if (!document) {
    console.info(`- Skipping ${document_id} because it has no document`);
    continue;
  }
  const extension = path.extname(fichier);
  const basename = path.basename(fichier, extension);
  const filePath = `documents/${
    document.subjectFISA === undefined ? 'fisea' : document.subjectFISA ? 'fisa' : 'fise'
  }/${document.subjectYearTier ?? 'anyone'}/${document.subjectUid}/${document.uid}/${ordre}-${slug(
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
  console.info(`- Created ${filePath} (${document.subjectUid})`);
}

const notfoundDocumentsCount = frappe_document.length - Object.keys(documentsResidual).length;

if (notfoundDocumentsCount > 0) {
  console.warn(`! Failed to create ${notfoundDocumentsCount} documents`);
}

if (NOTFOUND_SUBJECT_OLD_IDS.size > 0) {
  console.warn(
    `! No corresponding subject for the following matiere_ids:\n` +
      [...NOTFOUND_SUBJECT_OLD_IDS]
        .map((id) => `- #${id} ${frappe_matiere.find((m) => m.id === id.toString())!.nom}`)
        .join('\n'),
  );
  console.warn(
    `! It corresponds to the following majors:\n` +
      [
        ...new Set(
          frappe_filiere
            .filter((filiere) =>
              frappe_matiere.some(
                (matiere) =>
                  NOTFOUND_SUBJECT_OLD_IDS.has(parseFloat(matiere.id)) &&
                  matiere.filiere_id === filiere.id,
              ),
            )
            .map(
              (filiere) =>
                `${filiere.nom} ${
                  frappe_annee.find((annee) => annee.id === filiere.annee_id)!.nom
                }`,
            ),
        ),
      ].join('\n'),
  );
  console.info(
    `SQL request to see which matieres:


    SELECT * FROM \`frappe_matiere\`

    JOIN \`frappe_filiere\` ON filiere_id=\`frappe_filiere\`.\`id\`
    JOIN \`frappe_annee\` ON frappe_filiere.annee_id = frappe_annee.id

    WHERE frappe_matiere.id IN (${[...NOTFOUND_SUBJECT_OLD_IDS].join(
      ', ',
    )}) AND frappe_annee.ecole_id = 2;
    `,
  );
}
