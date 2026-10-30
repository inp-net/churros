import { Redis } from 'ioredis';
import { exit } from 'node:process';
import slug from 'slug';
import { tqdm } from 'ts-tqdm';
import {
  CredentialType,
  GroupType,
  PrismaClient,
  Visibility,
  type ContributionOption,
  type Event,
  type Group,
  type Major,
  type Minor,
  type Prisma,
  type School,
  type StudentAssociation,
  type Ticket,
  type User,
} from '../src/client/default.js';

// XXX: will break if we change the hashing algorithm (abstracted away in api package but not here)
import { hash } from 'argon2';
import { fakeMarkdown, faker, fakeTitle, getRandomLinks, storePicture, uniqueUid } from './utils.js';

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

const params = {
  numberOfSchools : 4, //Nombre d'école dans la DB de test
  //Il y aura 1 asso etudiante par école (obligé avec la manière dont tout est fait actuellement)
  //Et pour chaque asso etudiant il y aura 1 option de cotisation
  numberOfMajorsPerSchool : 4, //Nombre de filière par école dans la DB de test
  //la première filière de chaque école sera discontinued pour tester la gestion des filières obsolètes
  numberOfMinorsPerMajor : 4, //Nombre de spécialité par filière dans la DB de test
  numberOfStudentAssociationSection : 5, //Nombre de bureaux (groupes de type StudentAssociationSection) par asso étudiante dans la DB de test
  numberOfGroupsPerSchool : 50, //Nombre de groupes (clubs, assos, groupes) par école dans la DB de test
  numberOfSubGroupsPerSchool: 5, //Nombre de sous groupes dans la db de test (en gros juste des groupes en plus pour tester la hiérarchie de groupes)
  numberOfUsersPerSchool : 200, //Nombre d'utilisateur par école dans la DB de test à créer (les premiers sont les comptes rigolos legacy, et après c'est des comptes random)
  numberOfStudentAssociationAdminsPerSchool: 5, //Nombre d'admin par AE dans la DB de test
  maxNumberOfArticlesPerGroup : 10, //Nombre d'articles max à créer dans la DB de test pour chaque groupe
  maxNumberOfEventsPerGroup : 10, //Nombre d'événement max par groupe à créer dans la DB
  numberOfTicketsPerEvent : 5, //Nombre de tickets par événement à créer dans la DB
  maxNumberOfRegistrationsPerEvent : 100, //Nombre d'inscription max par événement pour un utilisateur aléatoire à créer dans la DB
}

console.info("Creating schools");

const schoolsData: Prisma.SchoolCreateInput[] = [];

for(let i = 0; i < params.numberOfSchools; i++){
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
for(let i = 0; i < params.numberOfMajorsPerSchool*params.numberOfSchools; i++){
  const name = faker.lorem.words({ min: 2, max: 5 });
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
for(let i = 0; i < params.numberOfMinorsPerMajor*params.numberOfMajorsPerSchool*params.numberOfSchools; i++){
  const name = faker.animal.petName();
  minorData.push({
    name,
    slug: slug(name+i), //pr eviter les doublons de slug
    majors: { connect: [{ id: majors[i % majors.length]!.id }] },
    yearTier: faker.helpers.arrayElement([1, 2, 3]), //On met des années random pour les spécialités
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
for(let i = 0; i < params.numberOfStudentAssociationSection*params.numberOfSchools; i++){
  const name = faker.food.ingredient();
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
  groups.push(await prisma.group.create({
    data: {
      ...group,
    },
  }));

  if (faker.datatype.boolean(0.8)) {
    await storePicture({
      folder: 'groups',
      extension: 'png',
      identifier: group.uid,
      resource: 'group',
    });
  }
}

console.info('Creating groups (lists, clubs, associations, groups, integrations groups)');

let groupsData : Prisma.GroupCreateInput[] = [];
for(let i = 0; i < params.numberOfGroupsPerSchool*params.numberOfSchools; i++){
  const name = faker.commerce.product();
  groupsData.push({
    name: name,
    uid: slug(name + i),
    color: faker.color.rgb(),
    type: faker.helpers.weightedArrayElement([
      { weight: 50, value: GroupType.Club },
      { weight: 20, value: GroupType.Association },
      { weight: 10, value: GroupType.Integration },
      { weight: 10, value: GroupType.List },
      { weight: 10, value: GroupType.Group },
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
  groups.push(await prisma.group.create({
    data: {
      ...group,
    },
  }));
  if (faker.datatype.boolean(0.8)) {
    await storePicture({
      folder: 'groups',
      extension: 'png',
      identifier: group.uid,
      resource: 'group',
    });
  }
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
for(let i = 0; i < params.numberOfSubGroupsPerSchool*params.numberOfSchools; i++){
  const name = faker.commerce.productAdjective();
  const parentGroup = groups[params.numberOfStudentAssociationSection*params.numberOfSchools + i]; //Pr prendre les groupes qui ne sont pas des sections d'assos étudiantes et avec 1 par école
  groupsData.push({
    name: name,
    uid: slug(name+i),
    color: faker.color.rgb(),
    type: faker.helpers.weightedArrayElement([
      { weight: 80, value: GroupType.Club },
      { weight: 20, value: GroupType.Group },
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
for(let i = 0; i < params.numberOfSchools; i++){
  contributionsOptionsData.push({
    paysFor: { connect: { id: studentAssociations[i]!.id } },
    name: studentAssociations[i]!.name,
    offeredIn: { connect: { id: schools[i]!.id } },
    price: faker.number.int({ min: 30, max: 200 }),
    beneficiary: undefined, //TODO : Ajouter les comptes lydia pour les associations étudiantes
  });
}

const contibutionOptions : ContributionOption[] = [];
for (const option of tqdm(contributionsOptionsData)) {
  contibutionOptions.push(
    await prisma.contributionOption.create({
      data: option,
    })
  );
}

console.log("Creating users");
//User rigolo de l'ancienne DB de test, que personne y touche on en est fier.
const funnyUserData: { firstName: string; lastName: string }[] = [
  { firstName: 'Annie', lastName: 'Versaire' }, 
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

  //Oauth 
  { firstName: 'Nathan', lastName: 'Pagnucco' },
];

const usersData: Prisma.UserCreateInput[] = [];
const usedUids = new Set<string>();
for(let i = 0; i < params.numberOfUsersPerSchool*params.numberOfSchools; i++){
  let firstName : string, lastName : string;
  if(i < funnyUserData.length){
    firstName = funnyUserData[i]!.firstName;
    lastName = funnyUserData[i]!.lastName;
  } else {
    firstName = faker.person.firstName();
    lastName = faker.person.lastName();
  }

  const uid = uniqueUid(firstName, lastName, usedUids);
  usedUids.add(uid);

  //Pour avoir un major random parmi ceux de la même école que la contribution option
  //Avec le min à 0 on prend aussi les majors qui sont discontinued, mettre à 1 pour les eviter
  const majorIndex = i % params.numberOfSchools + params.numberOfSchools * faker.number.int({ min: 0, max: params.numberOfMajorsPerSchool - 1 }); 
  //Pour avoir un minor random parmi ceux de la même major que l'utilisateur
  const minorIndex = majorIndex + majors.length * faker.number.int({ min: 0, max: params.numberOfMinorsPerMajor - 1 });

  let contributes : Prisma.ContributionCreateNestedManyWithoutUserInput | undefined = undefined;
  if(faker.datatype.boolean(0.6)){ //Chance de 60% d'avoir des cotisants
    contributes = {
      create : {
        paid: faker.datatype.boolean(0.5), //Chance de 50% d'avoir payé
        option: {
          connect: {id: contibutionOptions[i % params.numberOfSchools]!.id}, 
        }
      }
    }
  }

  usersData.push({ 
    firstName, 
    lastName,
    uid,
    email: faker.internet.email({ firstName, lastName }),
    graduationYear: faker.helpers.weightedArrayElement([
      { weight: 10, value: now.getFullYear() + 2 }, //1A
      { weight: 10, value: now.getFullYear() + 1 }, //2A
      { weight: 10, value: now.getFullYear() }, //3A
      { weight: 3, value: now.getFullYear() - 1 }, //4A
      { weight: 1, value: now.getFullYear() - 2 }, //5A
    ]),
    description: faker.lorem.paragraph({ min: 0, max: 5 }),
    links: {
      createMany: {
        data: getRandomLinks(faker.number.int({ min: 0, max: 5 })),
      }
    },
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    birthday: faker.date.birthdate({ min: 17, max: 25, mode: 'age' }),
    credentials: { create: { type: CredentialType.Password, value: passwordHash } },
    canAccessDocuments: true, //Techniquement plus nécessaire vu que la frappe est ailleurs mais on garde au cas ou
    contributions: contributes,
    major: { connect: { id: majors[majorIndex]!.id } },
    minor: { connect: { id: minors[minorIndex]!.id } },
  });
}

const users : User[] = [];
for (const user of tqdm(usersData)) {
  users.push(await prisma.user.create({
    data : {
      ...user
    }
  }));
  if (faker.datatype.boolean(0.65)) {
    await storePicture({
      folder: 'users',
      extension: 'jpg',
      identifier: user.uid,
      resource: 'user',
      kind: 'person',
    })
  }
}

console.log("Creating studentAssociationAdmins");
for (let i = 0; i < params.numberOfSchools; i++) {
  for (let j = 0; j < params.numberOfStudentAssociationAdminsPerSchool; j++) {
    const user = users[i + params.numberOfSchools * j]!;

    await prisma.studentAssociation.update({
      where: { id: studentAssociations[i]!.id },
      data: { admins: { connect: { id: user.id } } }, //TODO : Mettre des respos clubs aussi ?
    });
  }
}


console.info('Creating group members');
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
      createdAt: faker.date.past({ years: 1 }),
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[1]!.id,
      title: 'Trez',
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
      createdAt: faker.date.past({ years: 1 }),
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[2]!.id,
      title: 'VP',
      vicePresident: true,
      canEditArticles: true,
      canEditMembers: true,
      createdAt: faker.date.past({ years: 1 }),
    },
    {
      groupId: group.id,
      memberId: randomUserIDs[3]!.id,
      title: 'Secrétaire',
      canEditArticles: true,
      canEditMembers: true,
      createdAt: faker.date.past({ years: 1 }),
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
      createdAt: faker.date.past({ years: 1 }),
    });
  }
}

await prisma.groupMember.createMany({ data: groupMembers });

console.log("Creating articles");

const articleData: Prisma.ArticleCreateInput[] = [];
for(let i = 0; i < groups.length; i++){
  const nbArticles = faker.number.int({ min: 0, max: params.maxNumberOfArticlesPerGroup });
  for(let j = 0; j < nbArticles; j++){
    const createdAt = faker.date.past({ years: 1 });
    const publishedAt = faker.date.recent({ days: 10, refDate: now });;
    articleData.push({
      slug: `article-${i}-${j}`,
      title: fakeTitle(),
      body: fakeMarkdown(),
      createdAt,
      published: true,
      publishedAt,
      visibility: faker.helpers.weightedArrayElement([
        { weight: 50, value: Visibility.Public },
        { weight: 30, value: Visibility.SchoolRestricted },
        { weight: 30, value: Visibility.GroupRestricted },
        { weight: 20, value: Visibility.Private },
        { weight: 10, value: Visibility.Unlisted },        
      ]),
      group: { connect: { id: groups[i]!.id } },
      links: { createMany: { data: getRandomLinks(faker.number.int({ min: 0, max: 5 })) } },
    })
  }
}

for (const data of tqdm(articleData)) await prisma.article.create({ data });

console.log("Creating events");
const eventsData: Prisma.EventCreateInput[] = [];
for(let i = 0; i < groups.length; i++){
  const nbEvents = faker.number.int({ min: 0, max: params.maxNumberOfEventsPerGroup });
  for(let j = 0; j < nbEvents; j++){
    const startsAt = faker.date.soon({ days: 30 });
    eventsData.push({
      contactMail: faker.internet.email(), //TODO : Ptet mettre un vrai mail pour tester l'envoi des mails
      description: faker.lorem.paragraph(),
      startsAt: startsAt,
      endsAt: faker.date.soon({ days: 3, refDate: startsAt }),
      group: { connect: { id: groups[i]!.id } },
      slug: `event-${i}-${j}`,
      title: fakeTitle(),
      visibility: faker.helpers.weightedArrayElement([
        { weight: 50, value: Visibility.Public },
        { weight: 30, value: Visibility.SchoolRestricted },
        { weight: 30, value: Visibility.GroupRestricted },
        { weight: 20, value: Visibility.Private },
        { weight: 10, value: Visibility.Unlisted },        
      ]),
      links: { createMany: { data: getRandomLinks(faker.number.int({ min: 0, max: 5 })) } },
    });
  }
}

const events : Event[] = [];
for (const data of tqdm(eventsData)) {
  events.push(await prisma.event.create({ data: { ...data } }));
  if (faker.datatype.boolean(0.65)) {
    await storePicture({
      folder: 'events',
      extension: 'jpg',
      identifier: events[events.length - 1]!.id,
      resource: 'event',
    })
  }
}

console.log("Creating tickets");
const ticketsData: Prisma.TicketCreateInput[] = [];
for(let i = 0; i < events.length; i++){
  for(let j = 0; j < params.numberOfTicketsPerEvent; j++){
    const minimumPrice = faker.number.int({ min: 0, max: 10000 });
    const maximumPrice = faker.datatype.boolean(0.85)
      ? minimumPrice
      : faker.number.int({
          min: minimumPrice + 0.5,
          max: minimumPrice + 3000,
        });
    ticketsData.push({
      slug: `ticket-${i}-${j}`,
      name: faker.commerce.productName(),
      description: faker.company.buzzPhrase(),
      minimumPrice,
      maximumPrice,
      capacity: faker.number.int({ min: 30, max: 300 }),
      event: { connect: { id: events[i]!.id } },
      allowedPaymentMethods: faker.helpers.arrayElements(['Cash', 'Lydia', 'Card'], { min: 1, max: 3 }),
      inviteCode: faker.datatype.boolean(0.2) ? faker.string.nanoid(8) : undefined,
      links: { createMany: { data: getRandomLinks(faker.number.int({ min: 0, max: 1 })) } },
      openToAlumni: faker.datatype.boolean(),
      openToApprentices: faker.datatype.boolean(),
      openToExternal: faker.datatype.boolean(),
      openToContributors: faker.datatype.boolean(),
    });
  }
}

const tickets : Ticket[] = [];
for (const data of tqdm(ticketsData)) {
  tickets.push(await prisma.ticket.create({ data }));
}

console.info('Creating bookings');
const registrationData: Prisma.RegistrationCreateInput[] = [];
for (let i = 0; i < events.length; i++) {
  const nbRegistrations = faker.number.int({ min: 0, max: params.maxNumberOfRegistrationsPerEvent });
  for (let j = 0; j < nbRegistrations; j++) {
    const ticketIndex = i * params.numberOfTicketsPerEvent + faker.number.int({ min: 0, max: params.numberOfTicketsPerEvent - 1 });
    registrationData.push({
      createdAt: faker.date.recent({ days: 10, refDate: now }),
      ticket: { connect: { id: tickets[ticketIndex]!.id } },
      author: { connect: { id: faker.helpers.arrayElement(users)!.id } },
      externalBeneficiary: faker.datatype.boolean(0.2) ? faker.person.fullName() : undefined,
      paid: faker.datatype.boolean(0.5), 
    });
  }
}



await prisma.blockedUid.createMany({
  data: [{ uid: 'admin' }, { uid: 'root' }],
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
      majorId: faker.helpers.arrayElement(majors).id,
      apprentice: faker.datatype.boolean(),
      graduationYear: faker.number.int({min: 2022, max: 2026}),
      token: faker.string.uuid(),
      emailValidated: faker.datatype.boolean(0.8)
    } as Prisma.UserCandidateCreateInput
  }))
})

exit(0);
