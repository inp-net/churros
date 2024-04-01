import { prisma } from '#lib';
import { fakerFR } from '@faker-js/faker';
import {
  CredentialType,
  DocumentType,
  GroupType,
  LogoSourceType,
  Visibility,
  type Prisma,
} from '@prisma/client';
import { hash } from 'argon2';
import dichotomid from 'dichotomid';
import { exit } from 'node:process';
import slug from 'slug';

const faker = fakerFR; //j'avais la flemme de faire des FakerFRFR.machin partout
faker.seed(5); //seed de génération de la DB, pour générer une DB avec de nouvelles données il suffit juste de changer la valeur de la seed

const numberUserDB: number = 500; //Nombre d'utilisateur dans la DB de test
const numberEvent: number = 50; //Nombre d'événement créer dans la DB

function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) yield i;
  //js weighted array random
}

//const graduationYears = [...range()]
const color = (str: string) => {
  let hash = 0xc0_ff_ee;
  /* eslint-disable */
  for (const char of str) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  const red = ((hash & 0xff0000) >> 16) + 1;
  const green = ((hash & 0x00ff00) >> 8) + 1;
  const blue = (hash & 0x0000ff) + 1;
  /* eslint-enable */
  const l = 0.4 * red + 0.4 * green + 0.2 * blue;
  const h = (n: number) =>
    Math.min(0xd0, Math.max(0x60, Math.floor((n * 0xd0) / l)))
      .toString(16)
      .padStart(2, '0');
  return `#${h(red)}${h(green)}${h(blue)}`;
};

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function weightedRandomEnumValue<T extends Record<string | number, string | number>>(
  probabilities: Record<keyof T, number>,
): keyof T {
  return faker.helpers.weightedArrayElement(
    Object.keys(probabilities).map((key) => ({ weight: probabilities[key]!, value: key })),
  ) as keyof T;
}

// randomizes hours and minutes from given date
function randomTime(date: Date, hoursIn: Generator<number>): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    randomChoice([...hoursIn]),
    Math.floor(Math.random() * 60),
  );
}

const createUid = async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const toAscii = (x: string) =>
    slug(x.toLocaleLowerCase(), {
      charmap: {
        é: 'e',
        è: 'e',
        ê: 'e',
        ë: 'e',
        à: 'a',
        â: 'a',
        ä: 'a',
        ô: 'o',
        ö: 'o',
        û: 'u',
        ü: 'u',
        ï: 'i',
        ç: 'c',
      },
    }).replaceAll('-', '');
  const base = toAscii(lastName).slice(0, 16) + toAscii(firstName).charAt(0);
  const n = await dichotomid(async (n) => {
    const uid = `${base}${n > 1 ? n : ''}`;
    const existDB = Boolean(await prisma.user.findFirst({ where: { uid } }));
    return !existDB;
  });
  return `${base}${n > 1 ? n : ''}`;
};

const schoolsData = [
  {
    name: 'EAU',
    uid: 'o',
    color: '#00ffff',
    description: 'École de l’Eau',
    address: '2 rue Charles Camichel, 31000 Toulouse', //generation par faker possible ???
  },
  {
    name: 'FEU',
    uid: 'feu',
    color: '#b22222',
    description: 'École de Feu',
    address: '2 rue Charles Camichel, 31000 Toulouse',
  },
  {
    name: 'TERRE',
    uid: '3',
    color: '#5e3f13',
    description: 'École de Terre',
    address: '2 rue Charles Camichel, 31000 Toulouse',
  },
  {
    name: 'AIR',
    uid: 'air',
    color: '#d9eaff',
    description: 'École de l’Air',
    address: '2 rue Charles Camichel, 31000 Toulouse',
  },
];

const servicesData = [
  {
    name: 'Moodle',
    description: 'Plateforme de cours',
    url: 'https://moodle-n7.inp-toulouse.fr/',
    logo: 'https://copyleaks.com/wp-content/uploads/2022/08/moodle-m-with-grid-1024x1024.png',
    logoSourceType: LogoSourceType.ExternalLink,
  },
  {
    name: 'EDT',
    description: 'Emploi du temps',
    url: 'https://edt-n7.inp-toulouse.fr/',
    logo: 'Calendar',
    logoSourceType: LogoSourceType.Icon,
  },
];

for (const school of schoolsData) {
  await prisma.school.create({
    data: {
      ...school,
      services: {
        createMany: {
          data: servicesData,
        },
      },
    },
  });
}

const schools = await prisma.school.findMany();

const mecaniqueDesFluides = await prisma.major.create({
  data: {
    shortName: 'MFEE',
    uid: 'mfee',
    name: 'Mécanique des fluides',
    schools: { connect: { id: schools[0]!.id } },
  },
});
const sciencesDuNumerique = await prisma.major.create({
  data: {
    shortName: 'SN',
    uid: 'sn',
    name: 'Sciences du Numérique',
    schools: { connect: { id: schools[0]!.id } },
  },
});

const elec = await prisma.major.create({
  data: {
    shortName: 'EEEA',
    uid: 'eeea',
    name: 'éléectronique, énergie électrique & automatique',
    schools: { connect: { id: schools[0]!.id } },
  },
});

const majors = [mecaniqueDesFluides, sciencesDuNumerique, elec];

const plomberie = await prisma.minor.create({
  data: {
    name: 'Plomberie',
    uid: 'plomberie',
    majors: { connect: [{ id: mecaniqueDesFluides.id }] },
    yearTier: 1,
  },
});

const chomeur = await prisma.minor.create({
  data: {
    name: 'Chomeur',
    uid: 'chomeur',
    majors: { connect: [{ id: mecaniqueDesFluides.id }] },
    yearTier: 1,
  },
});

const transistor = await prisma.minor.create({
  data: {
    name: 'Transistor',
    uid: 'transistor',
    majors: { connect: [{ id: elec.id }] },
    yearTier: 1,
  },
});
const cableElec = await prisma.minor.create({
  data: {
    name: 'Cable Elec',
    uid: 'cable-elec',
    majors: { connect: [{ id: elec.id }] },
    yearTier: 1,
  },
});

const ia = await prisma.minor.create({
  data: {
    name: 'IA (fraude)',
    uid: 'ia',
    majors: { connect: [{ id: sciencesDuNumerique.id }] },
    yearTier: 1,
  },
});

const rezo = await prisma.minor.create({
  data: {
    name: 'Rezo',
    uid: 'rezo',
    majors: { connect: [{ id: elec.id }] },
    yearTier: 1,
  },
});

const minors = [plomberie, chomeur, transistor, cableElec, ia, rezo];

for (const [i, name] of ['AE EAU 2022', 'AE FEU 2022', 'AE TERRE 2022', 'AE AIR 2022'].entries()) {
  await prisma.studentAssociation.create({
    data: {
      uid: slug(name),
      description: 'Une association étudiante',
      name,
      school: { connect: { id: schools[i]!.id } },
      links: { create: [] },
      lydiaAccounts: {
        create: {
          name,
          vendorToken: 'b',
          privateToken: 'b',
        },
      },
    },
  });
}

const studentAssociations = await prisma.studentAssociation.findMany({ include: { school: true } });

for (const asso of studentAssociations) {
  for (const name of ['FOY', 'BDE', 'BDD', 'BDA', 'BDS']) {
    await prisma.group.create({
      data: {
        name,
        uid: slug(name + ' ' + asso.name),
        color: color(name),
        type: GroupType.StudentAssociationSection,
        studentAssociation: { connect: { id: asso.id } },
        links: {
          create: [],
        },
        address: '2 rue Charles Camichel, 31000 Toulouse',
        email: `${slug(name)}@list.example.com`,
        lyiaAccounts: {
          create: {
            name: `${asso.school.name.toUpperCase()} ${name.toUpperCase()}`,
            privateToken: 'a',
            vendorToken: 'a',
          },
        },
      },
    });
  }
}

const studentAssociationsWithLydiaAccounts = await prisma.studentAssociation.findMany({
  include: { school: true, lydiaAccounts: true },
});

for (const ae of studentAssociationsWithLydiaAccounts) {
  await prisma.contributionOption.create({
    data: {
      paysFor: { connect: { id: ae.id } },
      name: ae.name,
      offeredIn: { connect: { id: ae.school.id } },
      price: faker.number.int({ min: 30, max: 200 }),
      beneficiary:
        ae.lydiaAccounts.length > 0 ? { connect: { id: ae.lydiaAccounts[0]?.id } } : undefined,
    },
  });
}

const contributionOptions = await prisma.contributionOption.findMany({
  include: { offeredIn: true },
});

//User rigolo de l'ancienne DB de test, que personne y touche on en est fier.
const usersData = [
  { firstName: 'Annie', lastName: 'Versaire', admin: true }, //Unique compte de la DB qui possède les droits admin
  { firstName: 'Bernard', lastName: 'Tichaut', canEditGroups: true }, //Unique compte "respo club"
  { firstName: 'Camille', lastName: 'Honnête', canEditUsers: true },
  { firstName: 'Denis', lastName: 'Chon' },
  { firstName: 'Élie', lastName: 'Coptère' },
  { firstName: 'Fred', lastName: 'Voyage' },
  { firstName: 'Gérard', lastName: 'Menvu' },
  { firstName: 'Henri', lastName: 'Cochet' },
  { firstName: 'Inès', lastName: 'Alamaternité' },
  { firstName: 'Jennifer', lastName: 'Arepassé' },
  { firstName: 'Kelly', lastName: 'Diote' },
  { firstName: 'Lara', lastName: 'Clette' },
  { firstName: 'Marc', lastName: 'Des Points' },
  { firstName: 'Nordine', lastName: 'Ateur' },
  { firstName: 'Otto', lastName: 'Graf' },
  { firstName: 'Paul', lastName: 'Ochon' },
  { firstName: 'Quentin', lastName: 'Deux Trois' },
  { firstName: 'Sacha', lastName: 'Touille' },
  { firstName: 'Thérèse', lastName: 'Ponsable' },
  { firstName: 'Urbain', lastName: 'De Bouche' },
  { firstName: 'Vivien', lastName: 'Chezmoi' },
  { firstName: 'Wendy', lastName: 'Gestion' },
  { firstName: 'Xavier', lastName: 'K. Paétrela' },
  { firstName: 'Yvon', lastName: 'Enbavé' },
  { firstName: 'Zinédine', lastName: 'Pacesoir' },
  { firstName: 'Rick', lastName: 'Astley' }, //https://www.youtube.com/watch?v=dQw4w9WgXcQ
];

//création d'une liste des réseaux sociaux qu'on peut ref sur son profil churros
const socialMedia = [
  'Facebook',
  'Instagram',
  'Discord',
  'Twitter',
  'Linkedin',
  'Github',
  'Hackernews',
  'Anilist',
];

//ajout d'utilisateur aléatoire par Faker
for (let i = 0; i < numberUserDB - usersData.length; i++)
  usersData.push({ firstName: faker.person.firstName(), lastName: faker.person.lastName() });

for (const [_, data] of usersData.entries()) {
  const major = await prisma.major.findUniqueOrThrow({
    where: { id: faker.helpers.arrayElement(majors).id },
    include: { schools: true },
  });
  const minor = await prisma.minor.findUniqueOrThrow({
    where: { id: faker.helpers.arrayElement(minors).id },
  });

  await prisma.user.create({
    data: {
      ...data,
      uid: await createUid(data),
      email: faker.internet.email({ firstName: data.firstName, lastName: data.lastName }),
      description: faker.lorem.paragraph({ min: 0, max: 50 }),
      links: {
        create: faker.helpers
          .arrayElements(socialMedia, { min: 2, max: 6 })
          .map((name) => ({ name, value: '#' })),
      },
      contributions:
        faker.number.int({ min: 0, max: 10 }) % 10 === 0 //génération d'une majorité de cotissant
          ? {
              create: {
                paid: true,
                option: {
                  connect: {
                    id: contributionOptions.find((option) =>
                      major.schools.some((school) => school.id === option.offeredInId),
                    )!.id,
                  },
                },
              },
            }
          : undefined,
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      birthday: faker.date.birthdate({ min: 17, max: 25, mode: 'age' }),
      graduationYear: faker.helpers.weightedArrayElement([
        { weight: 10, value: 2026 },
        { weight: 10, value: 2025 },
        { weight: 10, value: 2024 },
        { weight: 3, value: 2023 },
        { weight: 1, value: 2022 },
      ]),
      major: { connect: { id: major.id } },
      minor: { connect: { id: minor.id } },
      credentials: { create: { type: CredentialType.Password, value: await hash('a') } },
      canAccessDocuments: true,
    },
  });
}
const users = await prisma.user.findMany();

const numberSubject: number = 10;
//creation de nbSubject pour toute les mineurs des filières possible

for (const [_, minor] of minors.entries()) {
  for (let j = 0; j < numberSubject; j++) {
    const title: string = faker.lorem.word();
    const subject = await prisma.subject.create({
      data: {
        name: title,
        uid: slug(title),
        minors: { connect: { id: minor.id } },
      },
    });
    await prisma.document.create({
      data: {
        description: faker.lorem.paragraph({ min: 2, max: 10 }),
        title: 'Un document',
        uid: 'un-document',
        schoolYear: faker.number.int({ min: 2015, max: 2024 }),
        subject: { connect: { id: subject.id } },
        type: faker.helpers.enumValue(DocumentType),
        uploader: {
          connect: {
            uid: faker.helpers.arrayElement(users.filter((element) => element.minorId === minor.id))
              .uid,
          },
        }, //recup uniquement les users de la bonne mineur pour en faire des auteurs
      },
    });
  }
}

const clubsData = [
  { name: 'Art' },
  { name: 'Basket' },
  { name: 'Cinéma' },
  { name: 'Danse' },
  { name: 'Escalade' },
  { name: 'Football' },
  { name: 'Golf' },
  { name: 'Handball' },
  { name: 'Igloo' },
  { name: 'Jardinage' },
  { name: 'Karaté' },
  { name: 'Lecture' },
  { name: 'Musique' },
  { name: 'Natation' },
  { name: 'Origami' },
  { name: 'Pétanque' },
  { name: 'Quidditch' },
  { name: 'Randonnée' },
  { name: 'Ski' },
  { name: 'Tennis' },
  { name: 'Ukulélé' },
  { name: 'Vélo' },
  { name: 'Water-polo' },
  { name: 'Xylophone' },
  { name: 'Yoga' },
  { name: 'Zumba' },
];

for (const [i, group] of clubsData.entries()) {
  const { id: groupId } = await prisma.group.create({
    data: {
      ...group,
      uid: slug(group.name),
      // ensure 3 list groups
      type:
        i < 3
          ? GroupType.List
          : (weightedRandomEnumValue({
              [GroupType.Club]: 0.75,
              [GroupType.Association]: 0.2,
              [GroupType.Integration]: 0.05,
            }) as GroupType),
      color: color(group.name),
      address: 'D202',
      email: `${slug(group.name)}@list.example.com`,
      website: `https://${slug(group.name)}.example.com`,
      description: `Club ${group.name} de l'école`,
      longDescription: `# Caeco ambrosia defendite simplicitas aequore caelestibus auro

      Lorem markdownum accessit desperat lumina; hi sed radice Scylla agger. Et ipsa
      cum **Tereus**, aequore sedet. [Quem qua](/) qui carmine,
      ore suus, fixa natus lacrimas.

      Perque dederat bracchia tenui Leucothoe in in sequitur fames non hic. Venitque
      sua anguem [sed](/) supponere sit, fluctus pedibusque ne apros
      rotis exauditi mater voluistis carinam habet generosam miserrima. Quoquam
      ulterius quam; pressit mihi germanae faciemque: in certa cruor solacia est caeli
      suos auras atra!

      > Explorant est illi inhaesuro doloris sed *inmanis* has recessu, quam interdum
      > hospes. Et huc postquam subdit incertas: echidnae, o cibique spectat sed
      > diversa. Placuit omnia; flammas Hoc ventis nobis primordia flammis Mavors
      > dabat horrida conplecti cremantur. A mundus, metu Anius gestare caelatus,
      > Alpheos est, lecti et?`,
      studentAssociation: { connect: { id: faker.helpers.arrayElement(studentAssociations).id } },
      links: {
        createMany: {
          data: [
            { name: 'Facebook', value: '#' },
            { name: 'Instagram', value: '#' },
          ],
        },
      },
    },
  });
  await prisma.group.update({
    where: { id: groupId },
    data: {
      familyRoot: { connect: { id: groupId } },
    },
  });
}

let IntégrationGroup = await prisma.group.create({
  data: {
    name: `Intégration ${new Date().getFullYear()}`,
    type: GroupType.Group,
    uid: `integration-${new Date().getFullYear()}`,
    color: '#ff0000',
    links: { create: [] },
  },
});

IntégrationGroup = await prisma.group.update({
  where: { id: IntégrationGroup.id },
  data: {
    familyRoot: { connect: { id: IntégrationGroup.id } },
  },
});
/*
const Groupe1 = await prisma.group.create({
  data: {
    name: 'Groupe 1',
    type: GroupType.Integration,
    uid: 'groupe-1',
    color: '#00ff00',
    parent: { connect: { id: Intégration2022.id } },
    familyRoot: { connect: { id: Intégration2022.familyId! } },
    links: { create: [] },
    // members: { createMany: { data: [{ memberId: 2 }, { memberId: 3 }, { memberId: 4 }] } },
  },
});
*/
await prisma.group.create({
  data: {
    name: 'Groupe 2',
    type: GroupType.Integration,
    uid: 'groupe-2',
    color: '#0000ff',
    parent: { connect: { id: IntégrationGroup.id } },
    familyRoot: { connect: { id: IntégrationGroup.familyId! } },
    links: { create: [] },
    // members: { createMany: { data: [{ memberId: 5 }, { memberId: 6 }, { memberId: 7 }] } },
  },
});

let groups = await prisma.group.findMany({ include: { members: { include: { member: true } } } });

const groupMembers: Prisma.GroupMemberCreateManyInput[] = [];

for (const group of groups) {
  const randomUserIDs = faker.helpers.arrayElements(users, { min: 10, max: 30 });
  //répartition des roles dans le club entre les membres
  groupMembers.push(
    {
      groupId: group.id,
      memberId: randomUserIDs[0]!.id,
      title: 'Prez',
      president: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[1]!.id,
      title: 'Trez',
      vicePresident: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[2]!.id,
      title: 'VP',
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[3]!.id,
      title: 'Secrétaire',
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[4]!.id,
      title: 'Respo Com',
      canEditArticles: true,
    }, //on peut continuer a souhait pour créer d'autres membres avec des roles spéciaux si besoin...
  );
  for (let i = 5; i < randomUserIDs.length; i++) {
    //on ajoute les membres restants
    groupMembers.push({
      groupId: group.id,
      memberId: randomUserIDs[i]!.id,
    });
  }
}

await prisma.groupMember.createMany({ data: groupMembers });

groups = await prisma.group.findMany({ include: { members: { include: { member: true } } } });

const articleData: Prisma.ArticleCreateInput[] = [];

const end = 26 * 5;
const currentDate = Date.now();
const startDate = new Date(faker.date.anytime({ refDate: currentDate })).getTime(); //génération d'une date autour de la date actuelle=date où tu build
const endDate = new Date(faker.date.future({ refDate: startDate })).getTime();

for (let i = 0; i < end; i++) {
  const group = faker.helpers.arrayElement(groups);
  articleData.push({
    uid: `article-${i}`,
    title: `Article ${i}`,
    group: {
      connect: {
        id: group.id,
      },
    },
    author:
      i % 11 === 0
        ? undefined
        : {
            connect: { id: faker.helpers.arrayElement(group.members.map((m) => m.member)).id },
          },
    body: `**Lorem ipsum dolor sit amet**, consectetur adipiscing elit. Ut feugiat velit sit amet tincidunt gravida. Duis eget laoreet sapien, id.

[Lorem ipsum dolor.](/)

# Partie 1

1. Un
2. Deux
3. Trois

# Partie 2

- Un
- Deux
- Trois
`,
    visibility: i % 3 === 0 ? Visibility.Public : Visibility.GroupRestricted,
    published: i % 7 > 1,
    createdAt: new Date(startDate * (1 - i / end) + endDate * (i / end)),
    publishedAt: new Date( //ce beau bordel je l'édit avec faker ???
      startDate * (1 - i / end) + endDate * (i / end) + (i % 7) * 24 * 60 * 60 * 1000,
    ),
    links: {
      create: [
        {
          name: 'Facebook',
          value: 'https://facebook.com',
        },
        {
          name: 'Trop cool',
          value: 'https://youtu.be/dQw4w9WgXcQ',
        },
      ],
    },
  });
}

for (const data of articleData) await prisma.article.create({ data });

await prisma.article.create({
  data: {
    title: "C'est le début de l'inté",
    body: `début de l'inté, vous allez devenir alcoolique et vomir partout`,
    uid: 'cest-le-debut-de-l-inte',
    group: {
      connect: { id: IntégrationGroup.id },
    },
    published: true,
    links: {
      create: [],
    },
  },
});

await prisma.article.create({
  data: {
    title: 'Le nouveau seeding semble ok',
    body: `début de l'inté, vous allez devenir alcoolique et vomir partout`,
    uid: 'le-nouveau-seeding-semble-ok',
    group: {
      connect: { id: IntégrationGroup.id },
    },
    published: true,
    links: {
      create: [],
    },
  },
});

const selectedClub = faker.helpers.arrayElements(groups, numberEvent);
const eventDate: Date = new Date();
for (const element of selectedClub) {
  const eventName = faker.lorem.words(3);
  const capacityEvent = faker.number.int({ min: 30, max: 300 });
  await prisma.event.create({
    data: {
      contactMail: 'hey@ewen.works',
      description: 'Ceci est un événement',
      endsAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      startsAt: new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate() + faker.number.int({ min: 0, max: 7 }),
      ),
      uid: slug(eventName),
      title: eventName,
      group: { connect: { id: element!.id } },
      visibility: Visibility.Public,
      articles: {
        createMany: {
          data: [
            {
              body: "Ceci est un article d'événement",
              groupId: element!.id,
              uid: 'ceci-est-un-article-d-evenement',
              title: "Ceci est un article d'événement",
            },
          ],
        },
      },
      links: {
        createMany: {
          data: [
            {
              name: 'Facebook',
              value: 'https://facebook.com',
            },
            {
              name: 'Trop cool',
              value: 'https://youtu.be/dQw4w9WgXcQ',
            },
          ],
        },
      },
      tickets: {
        createMany: {
          data: [
            {
              uid: `event-${element!.uid}`,
              name: `Event ${element!.name}`,
              description: 'blablabla ramenez vos culs par pitié je vous en supplie',
              price: faker.number.int({ min: 0, max: 30 }),
              capacity: capacityEvent,
              opensAt: new Date(
                eventDate.getFullYear(),
                eventDate.getMonth(),
                eventDate.getDate() + faker.number.int({ min: 0, max: 7 }),
              ),
              closesAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
              allowedPaymentMethods: ['Cash', 'Lydia', 'Card'],
              openToPromotions: [2024, 2025, 2026],
              openToAlumni: faker.datatype.boolean(),
              openToExternal: faker.datatype.boolean(),
              openToContributors: faker.datatype.boolean(),
              godsonLimit: 0,
              onlyManagersCanProvide: faker.datatype.boolean(),
            },
          ],
        },
      },
    },
    include: {
      tickets: true,
    },
  });
}

const events = await prisma.event.findMany({ include: { tickets: true } });
let selectedEvent = faker.helpers.arrayElement(events);

const registration = await prisma.registration.create({
  data: {
    ticketId: faker.helpers.arrayElement(selectedEvent.tickets).id,
    authorId: faker.helpers.arrayElement(users).id,
    paymentMethod: 'Lydia',
    paid: false,
    beneficiary: 'annie',
  },
});

for (const i of range(0, 100)) {
  selectedEvent = faker.helpers.arrayElement(events);
  await prisma.registration.create({
    data: {
      createdAt: randomTime(registration.createdAt, range(13, 23)),
      ticketId: faker.helpers.arrayElement(selectedEvent.tickets).id,
      authorId:
        i % 4 === 0
          ? // eslint-disable-next-line unicorn/no-null
            null
          : faker.helpers.arrayElement(users.filter((u) => u.id !== registration.authorId)).id, //c'est quoi l'objectif ? uwu :3
      authorEmail: i % 4 === 0 ? 'feur@quoi.com' : undefined,
      paymentMethod: i % 2 === 0 ? 'Lydia' : 'Cash',
      paid: true,
      beneficiary: i % 4 === 0 ? 'whatcoubeh' : faker.helpers.arrayElement(users).uid,
    },
  });
}

await prisma.ticket.update({
  where: { id: events[0]!.tickets[0]!.id },
  data: {
    openToGroups: {
      connect: [{ uid: 'ski' }],
    },
    links: {
      createMany: {
        data: [
          {
            name: "C'est le menu",
            value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ],
      },
    },
  },
});

const clubForBarWeek = faker.helpers.arrayElement(groups);
await prisma.barWeek.create({
  data: {
    endsAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    startsAt: new Date(),
    uid: `${clubForBarWeek.name}-2023`,
    description: `Semaine de bar de ${clubForBarWeek.name}!`,
    groups: {
      connect: [{ uid: clubForBarWeek.uid }],
    },
  },
});

const thirdPartyAppClub = await prisma.group.findUniqueOrThrow({
  where: { uid: faker.helpers.arrayElement(groups).uid },
});

await prisma.thirdPartyApp.create({
  data: {
    name: 'TVn7',
    description: 'TVn7',
    secret: await hash('chipichipi'),
    id: 'app:chapachapa',
    active: true,
    website: 'https://wiki.inpt.fr',
    allowedRedirectUris: {
      set: ['https://wiki.inpt.fr', 'http://localhost:5000'],
    },
    owner: { connect: { id: thirdPartyAppClub.id } },
  },
});

await prisma.shopItem.create({
  data: {
    uid: 'boules-quies',
    name: 'Boules quies',
    description: 'Acheter des boules quies pour pas entendre Téo',
    price: 10,
    stock: 0,
    max: 5,
    visibility: Visibility.Public,
    group: { connect: { uid: 'ski' } },
  },
});

await prisma.shopItem.create({
  data: {
    uid: 'server',
    name: 'Server',
    description: 'Atom 2 duo',
    price: 100_000,
    stock: 1,
    max: 5,
    visibility: Visibility.GroupRestricted,
    group: { connect: { uid: 'ski' } },
  },
});

await prisma.shopItem.create({
  data: {
    uid: 'rechauffement',
    name: 'Réchauffement Climatique',
    description:
      "Acheter un peu de réchauffement climatique, c'est gratuit et on en a en trop ! ![](https://jancovici.com/wp-content/uploads/2016/10/GES_graph13_en.png)",
    price: 0,
    stock: 0,
    max: 0,
    visibility: Visibility.Public,
    group: { connect: { uid: 'bdd-ae-eau-2022' } },
  },
});

exit(0);
