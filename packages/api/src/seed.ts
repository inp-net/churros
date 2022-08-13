import { CredentialType, GroupType, LinkType, Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { prisma } from './prisma.js';

await prisma.school.createMany({
  data: [{ name: 'EAU' }, { name: 'FEU' }, { name: 'TERRE' }, { name: 'AIR' }],
});

await prisma.major.create({
  data: { name: 'Mécanique des fluides', schools: { connect: { id: 1 } } },
});
await prisma.major.create({
  data: { name: 'Vapeur', schools: { connect: [{ id: 1 }, { id: 2 }] } },
});
await prisma.major.create({
  data: { name: 'Boue', schools: { connect: [{ id: 1 }, { id: 3 }] } },
});
await prisma.major.create({
  data: { name: 'Roche', schools: { connect: [{ id: 3 }] } },
});
await prisma.major.create({
  data: { name: 'Vent', schools: { connect: [{ id: 4 }] } },
});

await prisma.studentOrganization.createMany({
  data: [
    { name: 'AE EAU 2022', schoolId: 1, year: 2022 },
    { name: 'AE FEU 2022', schoolId: 2, year: 2022 },
    { name: 'AE TERRE 2022', schoolId: 3, year: 2022 },
    { name: 'AE AIR 2022', schoolId: 4, year: 2022 },
  ],
});

const userData = [
  { name: 'annie', firstname: 'Annie', lastname: 'Versaire', admin: true },
  { name: 'bernard', firstname: 'Bernard', lastname: 'Tichaut', canEditGroups: true },
  { name: 'camille', firstname: 'Camille', lastname: 'Honnête', canEditUsers: true },
  { name: 'denis', firstname: 'Denis', lastname: 'Chon' },
  { name: 'elie', firstname: 'Élie', lastname: 'Coptère' },
  { name: 'fred', firstname: 'Fred', lastname: 'Voyage' },
  { name: 'gerard', firstname: 'Gérard', lastname: 'Menvu' },
  { name: 'henri', firstname: 'Henri', lastname: 'Cochet' },
  { name: 'ines', firstname: 'Inès', lastname: 'Alamaternité' },
  { name: 'jennifer', firstname: 'Jennifer', lastname: 'Arepassé' },
  { name: 'kelly', firstname: 'Kelly', lastname: 'Diote' },
  { name: 'lara', firstname: 'Lara', lastname: 'Clette' },
  { name: 'marc', firstname: 'Marc', lastname: 'Des Points' },
  { name: 'nordine', firstname: 'Nordine', lastname: 'Ateur' },
  { name: 'otto', firstname: 'Otto', lastname: 'Graf' },
  { name: 'paul', firstname: 'Paul', lastname: 'Ochon' },
  { name: 'quentin', firstname: 'Quentin', lastname: 'Deux Trois' },
  { name: 'rick', firstname: 'Rick', lastname: 'Astley' },
  { name: 'sacha', firstname: 'Sacha', lastname: 'Touille' },
  { name: 'therese', firstname: 'Thérèse', lastname: 'Ponsable' },
  { name: 'urbain', firstname: 'Urbain', lastname: 'De Bouche' },
  { name: 'vivien', firstname: 'Vivien', lastname: 'Chezmoi' },
  { name: 'wendy', firstname: 'Wendy', lastname: 'Gestion' },
  { name: 'xavier', firstname: 'Xavier', lastname: 'K. Paétrela' },
  { name: 'yvon', firstname: 'Yvon', lastname: 'Enbavé' },
  { name: 'zinedine', firstname: 'Zinédine', lastname: 'Pacesoir' },
];

for (const [i, data] of userData.entries()) {
  await prisma.user.create({
    data: {
      ...data,
      email: `${data.name}@example.com`,
      biography: i % 2 ? "Salut c'est moi" : '',
      links: {
        create: [
          { type: LinkType.Facebook, value: '#' },
          { type: LinkType.Instagram, value: '#' },
          { type: LinkType.Telegram, value: '#' },
          { type: LinkType.Twitter, value: '#' },
        ],
      },
      phone: '0612345678',
      address: '2 rue Charles Camichel, 31000 Toulouse',
      birthday: new Date(2000, (i * 37) % 12, (i * 55) % 28),
      graduationYear: 2020 + (i % 6),
      majorId: (i % 5) + 1,
      credentials: { create: { type: CredentialType.Password, value: await hash(data.name) } },
    },
  });
}

const groups = [
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

await prisma.group.createMany({
  data: groups.map((group, i) => ({
    ...group,
    type: GroupType.Group,
    schoolId: (i % 4) + 1,
    studentOrganizationId: (i % 4) + 1,
  })),
});

const groupMembers: Prisma.GroupMemberCreateManyInput[] = [];

for (let groupId = 1; groupId <= 26; groupId++) {
  groupMembers.push(
    {
      groupId,
      memberId: groupId,
      title: 'Prez',
      president: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId,
      memberId: (groupId % 26) + 1,
      title: 'Trez',
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId,
      memberId: ((groupId + 1) % 26) + 1,
      title: 'Secrétaire',
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId,
      memberId: ((groupId + 2) % 26) + 1,
      title: 'Respo Com',
      canEditArticles: true,
    },
    {
      groupId,
      memberId: ((groupId + 3) % 26) + 1,
    },
    {
      groupId,
      memberId: ((groupId + 4) % 26) + 1,
    },
    {
      groupId,
      memberId: ((groupId + 5) % 26) + 1,
    }
  );
}

await prisma.groupMember.createMany({ data: groupMembers });

const articleData: Prisma.ArticleCreateManyInput[] = [];

const end = 26 * 5;
const startDate = new Date('2021-01-01T13:00:00.000Z').getTime();
const endDate = new Date('2022-09-01T13:00:00.000Z').getTime();

for (let i = 0; i < end; i++) {
  articleData.push({
    title: `Article ${i}`,
    groupId: ((i * 7) % 26) + 1,
    authorId: i % 11 === 0 ? undefined : ((i * 9) % 26) + 1,
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
    homepage: i % 3 === 0,
    published: i % 7 > 1,
    createdAt: new Date(startDate * (1 - i / end) + endDate * (i / end)),
    publishedAt: new Date(
      startDate * (1 - i / end) + endDate * (i / end) + (i % 7) * 24 * 60 * 60 * 1000
    ),
  });
}

await prisma.article.createMany({ data: articleData });
