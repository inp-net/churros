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

await createMinors(EEEA, 1, [
  {
    name: 'Électronique Numérique',
    shortName: 'EN',
  },
  {
    name: 'Génie Électrique et Automatique',
    shortName: 'GEA',
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
    '3': [
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
      FISA: [],
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
      ].map((m) => {
        let [code, semester, name] = m.split('-', 3).map((c) => c.trim()) as [
          string,
          string,
          string,
        ];
        let minor = undefined;
        if (/.+ \([A-Z]+\)$/.test(name)) {
          const [n, min] = name.split(' (', 2) as [string, string];
          name = n;
          minor = min.replace(')', '').toLowerCase();
        }

        return {
          name,
          oldFrappeCodes: Number.parseInt(code!, 10),
          semester: semester === 'S2' ? 2 : 1,
          minors: minor ? [minor.toLowerCase()] : ['gea', 'en'],
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

  for (const subject of subjects) {
    subject.shortName ??= subject.name;
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
          console.log(
            `\t\tMerging minors to ${JSON.stringify([
              ...subject.minors!,
              ...minors.map((m) => m.uid),
            ])}`,
          );
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
