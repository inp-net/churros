import { CredentialType, GroupType, LinkType, type Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { prisma } from './prisma.js';
import slug from 'slug';

await prisma.school.createMany({
  data: [
    { name: 'EAU', color: '#00ffff' },
    { name: 'FEU', color: '#b22222' },
    { name: 'TERRE', color: '#5e3f13' },
    { name: 'AIR', color: '#d9eaff' },
  ],
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

await prisma.studentAssociation.createMany({
  data: [
    { name: 'AE EAU 2022', schoolId: 1, year: 2022 },
    { name: 'AE FEU 2022', schoolId: 2, year: 2022 },
    { name: 'AE TERRE 2022', schoolId: 3, year: 2022 },
    { name: 'AE AIR 2022', schoolId: 4, year: 2022 },
  ],
});

const userData = [
  { uid: 'annie', firstName: 'Annie', lastName: 'Versaire', admin: true },
  { uid: 'bernard', firstName: 'Bernard', lastName: 'Tichaut', canEditGroups: true },
  { uid: 'camille', firstName: 'Camille', lastName: 'Honnête', canEditUsers: true },
  { uid: 'denis', firstName: 'Denis', lastName: 'Chon' },
  { uid: 'elie', firstName: 'Élie', lastName: 'Coptère' },
  { uid: 'fred', firstName: 'Fred', lastName: 'Voyage' },
  { uid: 'gerard', firstName: 'Gérard', lastName: 'Menvu' },
  { uid: 'henri', firstName: 'Henri', lastName: 'Cochet' },
  { uid: 'ines', firstName: 'Inès', lastName: 'Alamaternité' },
  { uid: 'jennifer', firstName: 'Jennifer', lastName: 'Arepassé' },
  { uid: 'kelly', firstName: 'Kelly', lastName: 'Diote' },
  { uid: 'lara', firstName: 'Lara', lastName: 'Clette' },
  { uid: 'marc', firstName: 'Marc', lastName: 'Des Points' },
  { uid: 'nordine', firstName: 'Nordine', lastName: 'Ateur' },
  { uid: 'otto', firstName: 'Otto', lastName: 'Graf' },
  { uid: 'paul', firstName: 'Paul', lastName: 'Ochon' },
  { uid: 'quentin', firstName: 'Quentin', lastName: 'Deux Trois' },
  { uid: 'rick', firstName: 'Rick', lastName: 'Astley' },
  { uid: 'sacha', firstName: 'Sacha', lastName: 'Touille' },
  { uid: 'therese', firstName: 'Thérèse', lastName: 'Ponsable' },
  { uid: 'urbain', firstName: 'Urbain', lastName: 'De Bouche' },
  { uid: 'vivien', firstName: 'Vivien', lastName: 'Chezmoi' },
  { uid: 'wendy', firstName: 'Wendy', lastName: 'Gestion' },
  { uid: 'xavier', firstName: 'Xavier', lastName: 'K. Paétrela' },
  { uid: 'yvon', firstName: 'Yvon', lastName: 'Enbavé' },
  { uid: 'zinedine', firstName: 'Zinédine', lastName: 'Pacesoir' },
];

for (const [i, data] of userData.entries()) {
  await prisma.user.create({
    data: {
      ...data,
      email: `${data.uid}@example.com`,
      description: i % 2 ? "Salut c'est moi" : '',
      links: {
        create: [
          { type: LinkType.Facebook, value: '#' },
          { type: LinkType.Instagram, value: '#' },
          { type: LinkType.Telegram, value: '#' },
          { type: LinkType.Twitter, value: '#' },
        ],
      },
      phone: '+33612345678',
      address: '2 rue Charles Camichel, 31000 Toulouse',
      birthday: new Date(2000, (i * 37) % 12, (i * 55) % 28),
      graduationYear: 2020 + (i % 6),
      majorId: (i % 5) + 1,
      credentials: { create: { type: CredentialType.Password, value: await hash(data.uid) } },
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

await prisma.group.createMany({
  data: groups.map((group, i) => ({
    ...group,
    slug: slug(group.name),
    type: GroupType.Club,
    color: color(group.name),
    schoolId: (i % 4) + 1,
    studentAssociationId: (i % 4) + 1,
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
