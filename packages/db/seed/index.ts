import { format } from 'date-fns';
import { Redis } from 'ioredis';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import slug from 'slug';
import { tqdm } from 'ts-tqdm';
import { pictureDestinationFile, updatePicture } from '../../api/src/lib/pictures.js';
import {
  CredentialType,
  DocumentType,
  GroupType,
  LogoSourceType,
  PrismaClient,
  QuestionKind,
  Visibility,
  type Group,
  type Major,
  type Minor,
  type Prisma,
  type School,
  type StudentAssociation,
} from '../src/client/default.js';

// XXX: will break if we change the hashing algorithm (abstracted away in api package but not here)
import { hash } from 'argon2';
import { createUid, downloadRandomImage, downloadRandomPeoplePhoto, faker, getRandomLinks, randomImageURL, storageRootDirectory, storePicture } from './utils.js';

const prisma = new PrismaClient();

const now = new Date();
const passwordHash = await hash('lovechurros');

// console.info(`Cleaning storage root ${storageRootDirectory}`);
// for (const folder of ['events']) {
//   if (!existsSync(path.join(storageRootDirectory, folder))) continue;
//   await Promise.all(
//     readdirSync(path.join(storageRootDirectory, folder))
//       .filter((file) => statSync(path.join(storageRootDirectory, folder, file)).isFile())
//       .map(async (file) => rm(path.join(storageRootDirectory, folder, file))),
//   );
// }

console.info('Clearing redis cache');
const redis = new Redis({
  host: new URL(process.env['REDIS_URL'] || 'redis://localhost:6379').hostname,
  port: Number.parseInt(new URL(process.env['REDIS_URL'] || 'redis://localhost:6379').port),
});
await redis.keys('*').then((keys) => {
  const pipeline = redis.pipeline();
  keys.forEach((key) => pipeline.del(key));
  pipeline.exec();
  console.info(`Deleted ${keys.length} keys`);
});

const parametres = {
  numberOfSchools : 4, //Nombre d'école dans la DB de test
  //Il y aura 1 asso etudiante par école (obligé avec la manière dont tout est fait actuellement)
  numberOfMajorsPerSchool : 4, //Nombre de filière par école dans la DB de test
  //la première filière de chaque école sera discontinued pour tester la gestion des filières obsolètes
  numberOfMinorsPerMajor : 4, //Nombre de spécialité par filière dans la DB de test
  numberOfStudentAssociationSection : 5, //Nombre de bureaux (groupes de type StudentAssociationSection) par asso étudiante dans la DB de test
  numberOfGroupsPerSchool : 50, //Nombre de groupes (clubs, assos, groupes) par école dans la DB de test
  numberOfSubGroupsPerSchool: 5, //Nombre de sous groupes dans la db de test (en gros juste des groupes en plus pour tester la hiérarchie de groupes)
  numberOfUsers : 500, //Nombre d'utilisateur dans la DB de test
  numberOfEvents : 50, //Nombre d'événement créer dans la DB
}

console.info("Creating schools");

const schoolsData: Prisma.SchoolCreateInput[] = [];

for(let i = 0; i < parametres.numberOfSchools; i++){
  const name = faker.company.buzzNoun();
  schoolsData.push({
    name,
    uid: slug(name),
    color: faker.color.rgb(),
    //TODO : Ajouter les services
  });
}

const schools : School[] = [];
for (const school of tqdm(schoolsData)) {
  schools.push(await prisma.school.create({
    data: {
      ...school,
    },
  }));
}


console.info("Creating majors");
const majorData: Prisma.MajorCreateInput[] = [];
for(let i = 0; i < parametres.numberOfMajorsPerSchool*parametres.numberOfSchools; i++){
  const name = faker.commerce.department();
  majorData.push({
    name,
    uid: slug(name),
    shortName: name.slice(0,5), //Pas vraiment representatif du vrai use case mais ça y est
    discontinued: Math.floor(i / schools.length) === 0,
    schools: { connect: { id: schools[i % schools.length]!.id } },
  });
}

const majors : Major[] = [];
for (const major of tqdm(majorData)) {
  majors.push(await prisma.major.create({
    data: {
      ...major,
    },
  }));
}

console.info("Creating minors");
const minorData: Prisma.MinorCreateInput[] = [];
for(let i = 0; i < parametres.numberOfMinorsPerMajor*parametres.numberOfMajorsPerSchool*parametres.numberOfSchools; i++){
  const name = faker.animal.petName();
  minorData.push({
    name,
    slug: slug(name),
    majors: { connect: [{ id: majors[i % majors.length]!.id }] },
    yearTier: 1,
  });
}

const minors : Minor[] = [];
for (const minor of tqdm(minorData)) {
  minors.push(await prisma.minor.create({
    data: {
      ...minor,
    },
  }));
}

console.info('Creating student associations');
const studentAssociationData: Prisma.StudentAssociationCreateInput[] = [];
for(let i = 0; i < schools.length; i++){
  const name = `AE ${faker.company.buzzNoun()}`;
  studentAssociationData.push({
    name,
    school: { connect: { id: schools[i]!.id } },
    uid: slug(name),
    description: faker.company.catchPhrase(),
    //TODO : Ajouter les services
    //TODO : Voir comment faire pour les comptes lydia pour avoir le secret (nouveau .env ?)
  });
}

const studentAssociations : StudentAssociation[] = [];
for (const studentAssociation of tqdm(studentAssociationData)) {
  studentAssociations.push(await prisma.studentAssociation.create({
    data: {
      ...studentAssociation,  
    },
  }));
}

console.info('Creating groups (student association sections)');
const studentAssociationSectionData: Prisma.GroupCreateInput[] = [];
for(let i = 0; i < parametres.numberOfStudentAssociationSection*parametres.numberOfSchools; i++){
  const name = faker.helpers.arrayElement(['FOY', 'BDE', 'BDD', 'BDA', 'BDS']);
  const asso = studentAssociations[i % studentAssociations.length]!;
  studentAssociationSectionData.push({
    name: name,
    uid: slug(name + ' ' + asso.name),
    color: faker.color.rgb(),
    type: GroupType.StudentAssociationSection,
    studentAssociation: { connect: { id: asso.id } },
    address: faker.location.streetAddress(),
    email: faker.internet.email({firstName: name, lastName: asso.name}),
    links: {
      createMany: {
        data: getRandomLinks(faker.number.int({ min: 0, max: 5 })),
      }
    },
    //TODO : Ajouter les comptes lydia
  });
}

const groups : Group[] = [];
for (const group of tqdm(studentAssociationSectionData)) {
  let pictureFile: string | undefined = undefined;
  if (faker.datatype.boolean(0.8)) {
    pictureFile = await storePicture({
      folder: 'groups',
      extension: 'png',
      identifier: group.uid,
      resource: 'group',
    });
  }
  groups.push(await prisma.group.create({
    data: {
      ...group,
      pictureFile: pictureFile,
    },
  }));
}

console.info('Creating groups (lists, clubs, associations, groups, integrations groups)');

let groupsData : Prisma.GroupCreateInput[] = [];
for(let i = 0; i < parametres.numberOfGroupsPerSchool*parametres.numberOfSchools; i++){
  const name = faker.commerce.product();
  groupsData.push({
    name: name,
    uid: slug(name),
    color: faker.color.rgb(),
    type: faker.helpers.weightedArrayElement([
      { weight: 0.5, value: GroupType.Club },
      { weight: 0.2, value: GroupType.Association },
      { weight: 0.1, value: GroupType.Integration },
      { weight: 0.1, value: GroupType.List },
      { weight: 0.1, value: GroupType.Group },
    ]),
    studentAssociation : { connect: { id: studentAssociations[i % studentAssociations.length]?.id } },
    address: faker.location.streetAddress(),
    email: faker.internet.email({firstName: name, lastName: 'churros'}),
    website: faker.internet.url(),
    description: faker.commerce.productMaterial(),
    longDescription: faker.lorem.paragraphs({ min: 0, max: 5 }),
    links: {
      createMany: {
        data: getRandomLinks(faker.number.int({ min: 0, max: 5 })),
      }
    },

  });
}

for (const group of tqdm(groupsData)) {
  let pictureFile: string | undefined = undefined;
  if (faker.datatype.boolean(0.8)) {
    pictureFile = await storePicture({
      folder: 'groups',
      extension: 'png',
      identifier: group.uid,
      resource: 'group',
    });
  }
  groups.push(await prisma.group.create({
    data: {
      ...group,
      pictureFile: pictureFile,
    },
  }));
}

for (const group of groups) {
  await prisma.group.update({ //pr etre honnete je sais pas si c'est indispensable, surement pour les sous clubs
    where: { id: group.id },
    data: {
      familyRoot: { connect: { id: group.id } },
    },
  });
}

console.log(`Creating sub-groups`);
groupsData = [];
for(let i = 0; i < parametres.numberOfSubGroupsPerSchool*parametres.numberOfSchools; i++){
  const name = faker.commerce.productAdjective();
  const parentGroup = groups[parametres.numberOfStudentAssociationSection*parametres.numberOfSchools + i]; //Pr prendre les groupes qui ne sont pas des sections d'assos étudiantes et avec 1 par école
  groupsData.push({
    name: name,
    uid: slug(name),
    color: faker.color.rgb(),
    type: faker.helpers.weightedArrayElement([
      { weight: 0.8, value: GroupType.Club },
      { weight: 0.2, value: GroupType.Group },
    ]),
    studentAssociation : { connect: { id: parentGroup?.studentAssociationId } },
    address: faker.location.streetAddress(),
    email: faker.internet.email({firstName: name, lastName: 'churros'}),
    website: faker.internet.url(),
    description: faker.commerce.productMaterial(),
    longDescription: faker.lorem.paragraphs({ min: 0, max: 5 }),
    links: {
      createMany: {
        data: getRandomLinks(faker.number.int({ min: 0, max: 5 })),
      }
    },
    familyRoot: { connect: { id: parentGroup!.id } },
  });
}

for (const group of tqdm(groupsData)) {
  groups.push(await prisma.group.create({
    data: {
      ...group,
    },
  }));
}

console.log("Creating contribution options");
const contributionsOptionsData: Prisma.ContributionOptionCreateInput[] = [];
for(let i = 0; i < parametres.numberOfSchools; i++){
  contributionsOptionsData.push({
    paysFor: { connect: { id: studentAssociations[i]!.id } },
    name: studentAssociations[i]!.name,
    offeredIn: { connect: { id: schools[i]!.id } },
    price: faker.number.int({ min: 30, max: 200 }),
    beneficiary: undefined, //TODO : Ajouter les comptes lydia pour les associations étudiantes
  });
}

for (const option of tqdm(contributionsOptionsData)) {
  await prisma.contributionOption.create({
    data: option,
  });
}

//User rigolo de l'ancienne DB de test, que personne y touche on en est fier.
const usersData: Array<Partial<Prisma.UserCreateInput>> = [
  { firstName: 'Annie', lastName: 'Versaire', admin: true }, //Unique compte de la DB qui possède les droits admin
  { firstName: 'Gwen', lastName: 'Le Bihan', admin: true, uid: 'lebihae' }, // Pour tester l'oauth
  { firstName: "Nathan", lastName: "Pagnucco", admin: true, uid: 'pagnuccon2' }, // Pour tester l'oauth
  { firstName: 'Bernard', lastName: 'Tichaut' },
  { firstName: 'Camille', lastName: 'Honnête' },
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
  { uid: 'exte', firstName: 'Jaipa', lastName: 'Dékol', minor: {}, major: {} }, // Compte exté
  {
    uid: 'valliet',
    firstName: 'Theodors',
    lastName: 'Vieux con',
  },
];

//ajout d'utilisateur aléatoire par Faker
for (let i = 0; i < numberUserDB - usersData.length; i++)
  usersData.push({ firstName: faker.person.firstName(), lastName: faker.person.lastName() });

console.info('Creating users');
for (const [_, data] of tqdm([...usersData.entries()])) {
  const major = await prisma.major.findUniqueOrThrow({
    where: { id: faker.helpers.arrayElement(majors).id },
    include: { schools: true },
  });
  const minor = await prisma.minor.findUniqueOrThrow({
    where: { id: faker.helpers.arrayElement(minors).id },
  });

  const uid = await createUid(prisma, data);
  await prisma.user.create({
    data: {
      uid,
      email: faker.internet.email({ firstName: data.firstName, lastName: data.lastName }),
      description: faker.lorem.paragraph({ min: 0, max: 5 }),
      links: {
        create: faker.helpers
          .arrayElements(socialMedia, { min: 2, max: 6 })
          .map((name) => ({ name, value: `https://${name}/${uid}` })),
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
      ...data,
    },
  });

  if (faker.datatype.boolean(0.65)) {
    const destinationPath = pictureDestinationFile({
      folder: 'users',
      extension: 'jpg',
      identifier: uid,
      root: storageRootDirectory,
    });

    if (!existsSync(destinationPath)) {
      await downloadRandomPeoplePhoto()
        .then(async (file) =>
          existsSync(destinationPath)
            ? prisma.user.update({
                where: { uid },
                data: {
                  pictureFile: path.relative(storageRootDirectory, destinationPath),
                },
              })
            : updatePicture({
                extension: 'jpg',
                folder: 'users',
                identifier: uid,
                resource: 'user',
                file,
                silent: true,
                root: storageRootDirectory,
              }),
        )
        .catch((error) =>
          console.warn(
            `Could not download random image: ${error}. This is not critical, seeding will continue`,
          ),
        );
    }
  }
}

// Créer des admins par AE
await Promise.all(
  studentAssociations.map(
    async (ae) =>
      await prisma.studentAssociation.update({
        where: { id: ae.id },
        data: {
          admins: {
            connect: faker.helpers
              .arrayElements(await prisma.user.findMany({ where: { admin: false } }), {
                min: 1,
                max: 5,
              })
              .map((u) => ({ id: u.id })),
          },
        },
      }),
  ),
);

for (const school of await prisma.school.findMany()) {
  const major = await prisma.major.findFirst({
    where: {
      schools: {
        some: {
          id: school.id,
        },
      },
    },
  });

  if (!major) {
    console.warn(
      `School ${school.uid} has no associated majors. Skipping kiosk bot account creation.`,
    );
    continue;
  }

  await prisma.user.create({
    data: {
      uid: `kiosk-${major.uid}`,
      email: `kiosk-${major.uid}@local`,
      firstName: `Kiosk`,
      lastName: major.name,
      graduationYear: 0,
      major: { connect: { id: major.id } },
      bot: true,
      credentials: {
        create: {
          type: 'Password',
          value: await hash('kioskmode'),
        },
      },
    },
  });
}

const users = await prisma.user.findMany();

console.info('Creating groups');



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
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[2]!.id,
      title: 'VP',
      vicePresident: true,
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
    slug: `article-${i}`,
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

console.info('Creating articles');
for (const data of tqdm(articleData)) await prisma.article.create({ data });

await prisma.article.create({
  data: {
    title: "C'est le début de l'inté",
    body: `début de l'inté, vous allez devenir alcoolique et vomir partout`,
    slug: 'cest-le-debut-de-l-inte',
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
    slug: 'le-nouveau-seeding-semble-ok',
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
console.info('Creating events');
for (const club of tqdm(selectedClub)) {
  const eventName = faker.lorem.words(3);
  const capacityEvent = faker.number.int({ min: 30, max: 300 });
  const minimumPrice = faker.number.int({ min: 0, max: 30 });
  const maximumPrice = faker.datatype.boolean(0.85)
    ? minimumPrice
    : faker.number.int({
        min: minimumPrice + 0.5,
        max: minimumPrice + 30,
      });
  const { id, tickets } = await prisma.event.create({
    data: {
      contactMail: 'hey@ewen.works',
      description: 'Ceci est un événement',
      endsAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      startsAt: new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate() + faker.number.int({ min: 0, max: 7 }),
      ),
      location: faker.datatype.boolean(0.85) ? faker.location.streetAddress() : '',
      includeInKiosk: faker.datatype.boolean(0.85),
      slug: slug(eventName),
      title: eventName,
      group: { connect: { id: club!.id } },
      visibility: Visibility.Public,
      articles: {
        createMany: {
          data: [
            {
              body: "Ceci est un article d'événement",
              groupId: club!.id,
              slug: 'ceci-est-un-article-d-evenement',
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
              slug: `event-${club!.uid}`,
              name: `Event ${club!.name}`,
              description: 'blablabla ramenez vos culs par pitié je vous en supplie',
              minimumPrice,
              maximumPrice,
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

  for (const ticket of tickets) {
    const inviteCode = faker.datatype.boolean(0.2) ? faker.string.nanoid(8) : undefined;
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        inviteCode,
        invited: inviteCode
          ? { connect: faker.helpers.arrayElements(users, 30).map((u) => ({ id: u.id })) }
          : undefined,
      },
    });
  }

  if (faker.datatype.boolean(0.45)) {
    await downloadRandomImage(800, 600, id)
      .then(async (file) =>
        prisma.event.update({
          where: { id },
          data: {
            pictureFile: await updatePicture({
              extension: 'jpg',
              folder: 'events',
              resource: 'event',
              file,
              identifier: id,
              silent: true,
              root: storageRootDirectory,
            }),
          },
        }),
      )
      .catch((error) =>
        console.warn(
          `Could not download random image: ${error}. This is not critical, seeding will continue`,
        ),
      );
  }
}

const events = await prisma.event.findMany({ include: { tickets: true } });
let selectedEvent = faker.helpers.arrayElement(events);

const registration = await prisma.registration.create({
  data: {
    ticketId: faker.helpers.arrayElement(selectedEvent.tickets).id,
    authorId: faker.helpers.arrayElement(users).id,
    paymentMethod: 'Lydia',
    paid: false,
    externalBeneficiary: 'annie',
  },
});

console.info('Creating bookings');
 await prisma.registration.createMany({
  data: [...range(0, 5000)].map((i) => {
    selectedEvent = faker.helpers.arrayElement(events);
    return {
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
      ...(i % 4 === 0
        ? { externalBeneficiary: 'whatcoubeh' }
        : { internalBeneficiaryId: faker.helpers.arrayElement(users).id }),
    };
  }),
}).then(({count}) => console.info(`Created ${count} bookings`));


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

for (let i = 0; i < 10; i++) {
  const opensAt = i === 0 ? faker.date.soon() : faker.date.anytime();
  const form = await prisma.form.create({
    data: {
      groupId: faker.helpers.arrayElement(groups).id,
      visibility: randomVisibility(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(faker.helpers.rangeToNumber({ min: 1, max: 3 })),
      createdById: faker.helpers.arrayElement(users).id,
      opensAt,
      closesAt: faker.date.future({ refDate: opensAt }),
      eventId: faker.datatype.boolean(0.3) ? faker.helpers.arrayElement(events).id : undefined,
    },
  });

  for (let ii = 0; ii < faker.number.int({ min: 1, max: 5 }); ii++) {
    const section = await prisma.formSection.create({
      data: {
        formId: form.id,
        order: ii,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
      },
    });
    const questions = Array.from({ length: faker.helpers.rangeToNumber({ min: 1, max: 5 }) })
      .fill(0)
      .map((_, i) => {
        const type = faker.helpers.arrayElement(
          Object.values(QuestionKind).filter((v) => v !== 'FileUpload'),
        );

        const scaleOptions: Partial<{ scaleStart: number; scaleEnd: number }> =
          type === 'Scale' ? { scaleStart: faker.number.int({ min: 1, max: 5 }) } : {};
        scaleOptions.scaleEnd =
          type === 'Scale' ? faker.number.int({ min: scaleOptions.scaleStart, max: 10 }) : 0;

        return {
          sectionId: section.id,
          description: faker.lorem.paragraph(),
          order: i,
          title: faker.lorem.sentence(),
          mandatory: faker.datatype.boolean(0.75),
          type,
          options: ['SelectOne', 'SelectMultiple'].includes(type)
            ? {
                set: [
                  ...new Set(
                    Array.from({ length: faker.helpers.rangeToNumber({ min: 2, max: 5 }) })
                      .fill(0)
                      .map(() => faker.lorem.word()),
                  ),
                ],
              }
            : type === 'Scale'
              ? { set: [faker.lorem.word(), faker.lorem.word()] }
              : undefined,
          allowedFiletypes: undefined,
          // type === 'FileUpload'
          //   ? Array.from({ length: faker.helpers.rangeToNumber({ min: 1, max: 10 }) })
          //       .fill(0)
          //       .map(() => faker.system.mimeType())
          //   : undefined,
          allowOptionOther:
            type === 'SelectOne' || type === 'SelectMultiple'
              ? faker.datatype.boolean(0.3)
              : undefined,
          ...scaleOptions,
        };
      });

    for (const question of questions) {
      await prisma.question.create({
        data: {
          ...question,
          answers: {
            createMany: {
              data: faker.helpers.arrayElements(users, { min: 1, max: 10 }).map((user) => {
                let value: string[] = [];

                switch (question.type) {
                  case 'Scale': {
                    value = [
                      faker.number.int({
                        min: 0,
                        max: question.scaleEnd! - question.scaleStart!,
                      }) +
                        '/' +
                        (question.scaleEnd! - question.scaleStart!),
                    ];
                    break;
                  }
                  case 'SelectOne': {
                    value = [faker.helpers.arrayElement(question.options!.set)];
                    break;
                  }
                  case 'SelectMultiple': {
                    value = faker.helpers.arrayElements(question.options!.set, {
                      min: 1,
                      max: 3,
                    });
                    break;
                  }
                  case 'Text': {
                    value = [faker.lorem.sentence()];
                    break;
                  }
                  // case 'FileUpload': {
                  //   value = [faker.system.fileName()];
                  //   break;
                  // }
                  case 'LongText': {
                    value = [faker.lorem.paragraph()];
                    break;
                  }
                  case 'Number': {
                    value = [faker.number.float({ min: -5, max: 20 }).toString()];
                    break;
                  }
                  case 'Date': {
                    value = [format(faker.date.past(), 'yyyy-MM-dd')];
                    break;
                  }
                  case 'Time': {
                    value = [format(faker.date.past(), 'HH:mm:ss')];
                    break;
                  }
                }
                return {
                  createdById: user.id,
                  createdAt: faker.date.recent(),
                  answer: {
                    set: value,
                  },
                };
              }),
            },
          },
        },
      });
    }
  }
}

async function randomPage() {
  const linkToGroup = faker.datatype.boolean();
  const page = await prisma.page.create({
    data: {
      body: faker.lorem.paragraphs(3),
      path:
        Array.from({ length: faker.number.int({ min: 0, max: 5 }) })
          .map(() => slug(faker.lorem.word()))
          .join('/') +
        '/' +
        faker.string.hexadecimal({ length: 8 }),
      title: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      ...(linkToGroup
        ? {
            group: {
              connect: { id: faker.helpers.arrayElement(await prisma.group.findMany()).id },
            },
          }
        : {
            studentAssociation: {
              connect: {
                id: faker.helpers.arrayElement(await prisma.studentAssociation.findMany()).id,
              },
            },
          }),
    },
  });

  return prisma.page.update({
    where: { id: page.id },
    data: {
      lastAuthorId: page.groupId
        ? // eslint-disable-next-line unicorn/no-await-expression-member
          (await randomMember(page.groupId)).id
        : faker.helpers.arrayElement(
            await prisma.user.findMany({
              where: {
                adminOfStudentAssociations: {
                  some: {
                    id: page.studentAssociationId!,
                  },
                },
              },
            }),
          ).id,
    },
  });
}

await Promise.all(
  Array.from({ length: 30 }).map(async () => {
    try {
      await randomPage();
    } catch {
      await randomPage().catch(console.error);
    }
  }),
);

await prisma.blockedUid.createMany({
  data: [{ uid: 'admin' }, { uid: 'root' }],
});
await prisma.user.update({
  where: { uid: 'versairea' },
  data: {
    bookmarks: {
      create: {
        path: '/users/alamaternitei',
      },
    },
  },
});

await prisma.user.update({
  where: { uid: 'alamaternitei' },
  data: {
    bookmarks: {
      create: {
        path: '/users/versairea',
      },
    },
  },
});

await prisma.theme.create({
  data: {
    name: '💖 UwU 💖',
    author: {
      connect: {
        uid: randomChoice(groups.map((g) => g.uid)),
      },
    },
    visibility: Visibility.Public,
    startsAt: new Date(),
    endsAt: new Date(new Date().setDate(new Date().getDate() + 7)),
    values: {
      createMany: {
        data: [
          { variable: 'ColorPrimary', value: 'DeepPink' },
          { variable: 'ColorPrimaryBackground', value: 'LightPink' },
        ],
      },
    },
  },
});

await prisma.promotion.create({
  data: {
    priceOverride: 1,
    type: 'SIMPPS',
    validByDefaultOn: {
      connect: {
        uid: 'art',
      },
    },
  },
});

await prisma.ticket
  .findMany({
    where: { inviteCode: { not: null } },
  })
  .then((tickets) => {
    for (const ticket of tickets) {
      console.info(
        `Ticket ${ticket.id} invite: http://localhost:5173/events/${ticket.eventId.replace(/^e:/, '')}/join/${ticket.inviteCode}`,
      );
    }
  });

await prisma.userCandidate.createMany({
  data: await Promise.all(Array.from({length: 50}).map(async () => {
    const name =  {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }
    return {
      ...name,
      email: faker.internet.email(),
      churrosPassword: await hash('hahahaha'),
      ldapPassword: await hash('hahahaha'),
      uid: faker.internet.username(name),
      majorId: randomChoice(majors).id,
      apprentice: faker.datatype.boolean(),
      graduationYear: faker.number.int({min: 2022, max: 2026}),
      token: faker.string.uuid(),
      emailValidated: faker.datatype.boolean(0.8)
    } as Prisma.UserCandidateCreateInput
  }))
})

exit(0);
