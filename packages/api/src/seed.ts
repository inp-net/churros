/**
 * This file is used to seed the database with some initial data.
 *
 * You can reset your database by running `yarn reset`.
 *
 * @module
 */

import {
  CredentialType,
  Visibility,
  GroupType,
  type Prisma,
  NotificationType,
} from '@prisma/client';
import { hash } from 'argon2';
import slug from 'slug';
import { prisma } from './prisma.js';
import { createUid } from './services/registration.js';

type SizedArray<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

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

function randomIdOf(objects: Array<{ id: string }>): string {
  return randomChoice(objects).id;
}

function randomIdsOf<Count extends number>(
  objects: Array<{ id: string }>,
  count: Count
): SizedArray<string, Count> {
  const result = [] as string[];
  let pool = objects;
  while (result.length < count) {
    const choice = randomChoice(pool);
    result.push(choice.id);
    pool = pool.filter((o) => o.id !== choice.id);
  }

  return result as SizedArray<string, Count>;
}

await prisma.school.createMany({
  data: [
    { name: 'EAU', uid: 'o', color: '#00ffff' },
    { name: 'FEU', uid: 'feu', color: '#b22222' },
    { name: 'TERRE', uid: '3', color: '#5e3f13' },
    { name: 'AIR', uid: 'air', color: '#d9eaff' },
  ],
});

const schools = await prisma.school.findMany();

const MécaniqueDesFluides = await prisma.major.create({
  data: {
    shortName: 'MFEE',
    name: 'Mécanique des fluides',
    schools: { connect: { id: schools[0]!.id } },
  },
});
const Vapeur = await prisma.major.create({
  data: {
    shortName: 'Va',
    name: 'Vapeur',
    schools: { connect: [{ id: schools[0]!.id }, { id: schools[1]!.id }] },
  },
});
const Boue = await prisma.major.create({
  data: {
    shortName: 'B',
    name: 'Boue',
    schools: { connect: [{ id: schools[1 - 1]!.id }, { id: schools[3 - 1]!.id }] },
  },
});
const Roche = await prisma.major.create({
  data: { shortName: 'R', name: 'Roche', schools: { connect: [{ id: schools[3 - 1]!.id }] } },
});
const Vent = await prisma.major.create({
  data: { shortName: 'Ve', name: 'Vent', schools: { connect: [{ id: schools[4 - 1]!.id }] } },
});

const majors = [MécaniqueDesFluides, Vapeur, Boue, Roche, Vent];

for (const [i, name] of ['AE EAU 2022', 'AE FEU 2022', 'AE TERRE 2022', 'AE AIR 2022'].entries()) {
  await prisma.studentAssociation.create({
    data: {
      name,
      school: { connect: { id: schools[i]!.id } },
      year: 2022,
      links: { create: [] },
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
            uid: `${slug(asso.school.name)}-${slug(name)}`,
            privateToken: 'a',
            vendorToken: 'a',
          },
        },
      },
    });
  }
}

const usersData = [
  { firstName: 'Annie', lastName: 'Versaire', admin: true },
  { firstName: 'Bernard', lastName: 'Tichaut', canEditGroups: true },
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
  { firstName: 'Rick', lastName: 'Astley' },
  { firstName: 'Sacha', lastName: 'Touille' },
  { firstName: 'Thérèse', lastName: 'Ponsable' },
  { firstName: 'Urbain', lastName: 'De Bouche' },
  { firstName: 'Vivien', lastName: 'Chezmoi' },
  { firstName: 'Wendy', lastName: 'Gestion' },
  { firstName: 'Xavier', lastName: 'K. Paétrela' },
  { firstName: 'Yvon', lastName: 'Enbavé' },
  { firstName: 'Zinédine', lastName: 'Pacesoir' },
]; // satisfies Array<Partial<Prisma.UserCreateInput>>;

for (const [i, data] of usersData.entries()) {
  await prisma.user.create({
    data: {
      ...data,
      uid: await createUid(data),
      email: `${data.firstName.toLowerCase().replace(/[^a-z]/g, '-')}.${data.lastName
        .toLowerCase()
        .replace(/[^a-z]/g, '-')}@${randomChoice([
        'gmail.com',
        'outlook.com',
        'hotmail.fr',
        'orange.fr',
        'free.fr',
        'gmail.fr',
        'laposte.net',
        'wanadoo.fr',
        'sfr.fr',
      ])}`,
      description: i % 2 ? "Salut c'est moi" : '',
      links: {
        create: [
          { name: 'Facebook', value: '#' },
          { name: 'Instagram', value: '#' },
          { name: 'Telegram', value: '#' },
          { name: 'Twitter', value: '#' },
        ],
      },
      phone: '+33612345678',
      address: '2 rue Charles Camichel, 31000 Toulouse',
      birthday: new Date(Date.UTC(2000, (i * 37) % 12, (i * 55) % 28)),
      graduationYear: 2020 + (i % 6),
      major: { connect: { id: randomIdOf(majors) } },
      credentials: { create: { type: CredentialType.Password, value: await hash('a') } },
      notificationSettings: {
        create: Object.values(NotificationType).map((type) => ({
          type,
          allow: true,
          // eslint-disable-next-line unicorn/no-null
          groupId: null,
        })),
      },
    },
  });
}

const users = await prisma.user.findMany();

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
for (const [_, group] of clubsData.entries()) {
  const { id: groupId } = await prisma.group.create({
    data: {
      ...group,
      uid: slug(group.name),
      type: GroupType.Club,
      color: color(group.name),
      address: 'D202',
      email: `${slug(group.name)}@list.example.com`,
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
      school: { connect: { id: randomIdOf(schools) } },
      studentAssociation: { connect: { id: randomIdOf(studentAssociations) } },
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

let Intégration2022 = await prisma.group.create({
  data: {
    name: 'Intégration 2022',
    type: GroupType.Group,
    uid: 'integration-2022',
    color: '#ff0000',
    links: { create: [] },
  },
});

Intégration2022 = await prisma.group.update({
  where: { id: Intégration2022.id },
  data: {
    familyRoot: { connect: { id: Intégration2022.id } },
  },
});

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

await prisma.group.create({
  data: {
    name: 'Groupe 2',
    type: GroupType.Integration,
    uid: 'groupe-2',
    color: '#0000ff',
    parent: { connect: { id: Intégration2022.id } },
    familyRoot: { connect: { id: Intégration2022.familyId! } },
    links: { create: [] },
    // members: { createMany: { data: [{ memberId: 5 }, { memberId: 6 }, { memberId: 7 }] } },
  },
});

let groups = await prisma.group.findMany({ include: { members: { include: { member: true } } } });

const groupMembers: Prisma.GroupMemberCreateManyInput[] = [];

for (const group of groups) {
  const randomUserIDs = randomIdsOf(users, 7);
  groupMembers.push(
    {
      groupId: group.id,
      memberId: randomUserIDs[0],
      title: 'Prez',
      president: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[1],
      title: 'Trez',
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[2],
      title: 'Secrétaire',
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[3],
      title: 'Respo Com',
      canEditArticles: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[4],
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[5],
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[6],
    }
  );
}

await prisma.groupMember.createMany({ data: groupMembers });

groups = await prisma.group.findMany({ include: { members: { include: { member: true } } } });

const articleData: Prisma.ArticleCreateInput[] = [];

const end = 26 * 5;
const startDate = new Date('2021-01-01T13:00:00.000Z').getTime();
const endDate = new Date('2022-09-01T13:00:00.000Z').getTime();

for (let i = 0; i < end; i++) {
  const group = randomChoice(groups);
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
            connect: { id: randomIdOf(group.members.map((m) => m.member)) },
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
    visibility: i % 3 === 0 ? Visibility.Public : Visibility.Restricted,
    published: i % 7 > 1,
    createdAt: new Date(startDate * (1 - i / end) + endDate * (i / end)),
    publishedAt: new Date(
      startDate * (1 - i / end) + endDate * (i / end) + (i % 7) * 24 * 60 * 60 * 1000
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
    body: '_youpi_',
    uid: 'cest-le-debut-de-l-inte',
    group: {
      connect: { id: Intégration2022.id },
    },
    published: true,
    links: {
      create: [],
    },
  },
});

const event1 = await prisma.event.create({
  data: {
    contactMail: 'hey@ewen.works',
    description: 'Ceci est un événement',
    endsAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    startsAt: new Date(),
    uid: 'ceci-est-un-evenement',
    title: 'Ceci est un événement',
    group: { connect: { id: Groupe1.id } },
    visibility: Visibility.Public,
    articles: {
      createMany: {
        data: [
          {
            body: "Ceci est un article d'événement",
            groupId: Groupe1.id,
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
            uid: 'staff-tvn7',
            name: 'Staff TVn7',
            description: 'Staffeurs :sparkles: TVn7 :sparkles:, par ici!',
            price: 0,
            capacity: 12,
            opensAt: new Date(),
            closesAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            allowedPaymentMethods: ['Cash', 'Lydia', 'Card'],
            openToPromotions: [2024, 2025, 2026],
            openToAlumni: false,
            openToExternal: false,
            openToNonAEContributors: false,
            godsonLimit: 0,
            onlyManagersCanProvide: false,
          },
        ],
      },
    },
  },
  include: {
    tickets: true,
  },
});

await prisma.ticket.update({
  where: { id: event1.tickets[0]!.id },
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

await prisma.event.create({
  data: {
    contactMail: 'contact@tvn7.fr',
    description: 'Viens passer la passation TVn7 avec nous !',
    endsAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    startsAt: new Date(),
    uid: 'passation-tvn7',
    title: 'Passation TVn7',
    visibility: Visibility.Restricted,
    author: { connect: { uid: 'deuxtroisq' } },
    group: { connect: { uid: 'ski' } },
    links: {
      createMany: {
        data: [
          {
            name: 'Menu',
            value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ],
      },
    },
    tickets: {
      createMany: {
        data: [
          {
            name: '',
            description: '',
            uid: 'ticket',
            price: 3.5,
            capacity: 70,
            allowedPaymentMethods: ['Lydia'],
            closesAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            opensAt: new Date(),
            godsonLimit: 0,
            // eslint-disable-next-line unicorn/no-null
            openToAlumni: null,
            openToExternal: false,
            // eslint-disable-next-line unicorn/no-null
            openToNonAEContributors: null,
            openToPromotions: [],
          },
        ],
      },
    },
  },
});

const registration = await prisma.registration.create({
  data: {
    ticketId: randomIdOf(event1.tickets),
    authorId: randomIdOf(users),
    paymentMethod: 'Lydia',
    paid: false,
    beneficiary: 'annie',
  },
});

await prisma.registration.create({
  data: {
    ticketId: randomIdOf(event1.tickets),
    authorId: randomIdOf(users.filter((u) => u.id !== registration.authorId)),
    paymentMethod: 'Lydia',
    paid: true,
    beneficiary: 'quentin',
  },
});

await prisma.barWeek.create({
  data: {
    endsAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    startsAt: new Date(),
    uid: 'ski-escalade-2023',
    description: 'Semaine de bar de ski et escalade!',
    groups: {
      connect: [{ uid: 'ski' }, { uid: 'escalade' }],
    },
  },
});
