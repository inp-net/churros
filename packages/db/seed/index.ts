import { fakerFR } from '@faker-js/faker';
import { format } from 'date-fns';
import dichotomid from 'dichotomid';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import slug from 'slug';
import { tqdm } from 'ts-tqdm';
import { pictureDestinationFile, updatePicture } from '../../api/src/lib/pictures.js';
import { storageRoot } from '../../api/src/lib/storage.js';
import {
  CredentialType,
  DocumentType,
  GroupType,
  LogoSourceType,
  PrismaClient,
  QuestionKind,
  Visibility,
  type Prisma,
} from '../src/client/default.js';

// XXX: will break if we change the hashing algorithm (abstracted away in api package but not here)
import { hash } from 'argon2';

const prisma = new PrismaClient();

const faker = fakerFR;
faker.seed(5);

const storageRootDirectory = storageRoot();

// console.info(`Cleaning storage root ${storageRootDirectory}`);
// for (const folder of ['events']) {
//   if (!existsSync(path.join(storageRootDirectory, folder))) continue;
//   await Promise.all(
//     readdirSync(path.join(storageRootDirectory, folder))
//       .filter((file) => statSync(path.join(storageRootDirectory, folder, file)).isFile())
//       .map(async (file) => rm(path.join(storageRootDirectory, folder, file))),
//   );
// }

async function randomMember(groupId: string) {
  return faker.helpers.arrayElement(
    await prisma.user.findMany({
      where: {
        groups: {
          some: {
            groupId,
          },
        },
      },
    }),
  );
}

const numberUserDB: number = 500; //Nombre d'utilisateur dans la DB de test
const numberEvent: number = 50; //Nombre d'événement créer dans la DB

function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) yield i;
  //js weighted array random
}

function randomVisiblity(): Visibility {
  return faker.helpers.arrayElement(Object.values(Visibility));
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

function randomImageURL(width: number, height: number, seed: string): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// download a random placeholder image from unsplash with the given width and height
// return a File object (for use with updatePicture)
async function downloadRandomImage(width: number, height: number, seed: string): Promise<File> {
  const response = await fetch(randomImageURL(width, height, seed));
  const blob = await response.blob();
  return new File([blob], path.basename(new URL(response.url).pathname), { type: 'image/jpeg' });
}

// download a random placeholder of a person's photo, using thispersondoesnotexist.com
// so no real actual people, but realistic AI-generated photos of people
async function downloadRandomPeoplePhoto(): Promise<File> {
  const response = await fetch('https://thispersondoesnotexist.com');
  return new File([await response.blob()], 'profile.jpeg', { type: 'image/jpeg' });
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

const schoolsData: Prisma.SchoolCreateInput[] = [
  {
    name: 'EAU',
    uid: 'eau',
    color: '#00ffff',
    description: 'École de l’Eau',
    address: faker.location.streetAddress(),
  },
  {
    name: 'FEU',
    uid: 'feu',
    color: '#b22222',
    description: 'École de Feu',
    address: faker.location.streetAddress(),
    studentMailDomain: 'etu.inp-n7.fr',
    aliasMailDomains: ['etu.toulouse-inp.fr'],
    majors: {
      create: {
        name: 'Filière unique',
        uid: 'filiere-feu',
      },
    },
  },
  {
    name: 'TERRE',
    uid: 'terre',
    color: '#5e3f13',
    description: 'École de Terre',
    address: faker.location.streetAddress(),
    studentMailDomain: faker.internet.domainName(),
    aliasMailDomains: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(
      faker.internet.domainName,
    ),
    majors: {
      create: {
        name: 'Filière unique TERRE',
        uid: 'filiere-terre',
      },
    },
  },
  {
    name: 'AIR',
    uid: 'air',
    color: '#d9eaff',
    description: 'École de l’Air',
    address: faker.location.streetAddress(),
    studentMailDomain: faker.internet.domainName(),
    aliasMailDomains: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(
      faker.internet.domainName,
    ),
    majors: {
      create: {
        name: 'Filière unique AIR',
        uid: 'filiere-air',
      },
    },
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

console.info('Creating schools');
for (const school of tqdm(schoolsData)) {
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
    uid: 'sdn',
    name: 'Sciences du Numérique',
    schools: { connect: { id: schools[0]!.id } },
  },
});

const ir = await prisma.major.create({
  data: {
    shortName: 'IR',
    uid: 'irezo',
    name: 'Informatique & Réseau',
    discontinued: true,
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
    slug: 'plomberie',
    majors: { connect: [{ id: mecaniqueDesFluides.id }] },
    yearTier: 1,
  },
});

const chomeur = await prisma.minor.create({
  data: {
    name: 'Chomeur',
    slug: 'chomeur',
    majors: { connect: [{ id: mecaniqueDesFluides.id }] },
    yearTier: 1,
  },
});

const transistor = await prisma.minor.create({
  data: {
    name: 'Transistor',
    slug: 'transistor',
    majors: { connect: [{ id: elec.id }] },
    yearTier: 1,
  },
});
const cableElec = await prisma.minor.create({
  data: {
    name: 'Cable Elec',
    slug: 'cable-elec',
    majors: { connect: [{ id: elec.id }] },
    yearTier: 1,
  },
});

const ia = await prisma.minor.create({
  data: {
    name: 'IA (fraude)',
    slug: 'ia',
    majors: { connect: [{ id: sciencesDuNumerique.id }] },
    yearTier: 1,
  },
});

const rezo = await prisma.minor.create({
  data: {
    name: 'Rezo',
    slug: 'rezo',
    majors: { connect: [{ id: elec.id }] },
    yearTier: 1,
  },
});

const minors = [plomberie, chomeur, transistor, cableElec, ia, rezo];

console.info('Creating student associations');
for (const [i, name] of tqdm([
  ...['AE EAU 2022', 'AE FEU 2022', 'AE TERRE 2022', 'AE AIR 2022'].entries(),
])) {
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
      services: {
        createMany: {
          data: Array.from({ length: faker.number.int({ min: 3, max: 5 }) }).map(() =>
            faker.datatype.boolean(0.6)
              ? {
                  logo: randomImageURL(400, 400, name),
                  name: faker.company.name(),
                  logoSourceType: LogoSourceType.ExternalLink,
                }
              : faker.datatype.boolean(0.5)
                ? {
                    logo: '',
                    logoSourceType: LogoSourceType.GroupLogo,
                    name: faker.company.name(),
                  }
                : {
                    logo: '',
                    logoSourceType: LogoSourceType.Icon,
                    name: faker.company.name(),
                  },
          ),
        },
      },
    },
  });
}

const studentAssociations = await prisma.studentAssociation.findMany({ include: { school: true } });

for (const asso of studentAssociations) {
  for (const name of ['FOY', 'BDE', 'BDD', 'BDA', 'BDS']) {
    const { uid, id } = await prisma.group.create({
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

    if (faker.datatype.boolean(0.8)) {
      const destinationPath = pictureDestinationFile({
        folder: 'groups',
        extension: 'png',
        identifier: uid,
        root: storageRootDirectory,
      });
      await (existsSync(destinationPath)
        ? prisma.group.update({
            where: { id },
            data: {
              pictureFile: path.relative(storageRootDirectory, destinationPath),
            },
          })
        : downloadRandomImage(400, 400, uid)
            .then((file) =>
              updatePicture({
                extension: 'png',
                folder: 'groups',
                identifier: uid,
                resource: 'group',
                file,
                silent: true,
                root: storageRootDirectory,
              }),
            )
            .catch((error) =>
              console.warn(
                `Could not download random image: ${error}. This is not critical, seeding will continue`,
              ),
            ));
    }
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
const usersData: Array<Partial<Prisma.UserCreateInput>> = [
  { firstName: 'Annie', lastName: 'Versaire', admin: true }, //Unique compte de la DB qui possède les droits admin
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
    major: {
      connect: {
        uid: ir.uid,
      },
    },
  },
];

//création d'une liste des réseaux sociaux qu'on peut ref sur son profil churros
const socialMedia = [
  'facebook.com',
  'instagram.com',
  'discord.com',
  'twitter.com',
  'linkedin.com/in',
  'github.com',
  'anilist.co',
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

  const uid = await createUid(data)
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

const numberSubject: number = 10;
//creation de nbSubject pour toute les mineurs des filières possible

console.info('Creating minors, subjects and documents');
for (const [_, minor] of tqdm([...minors.entries()])) {
  for (let j = 0; j < numberSubject; j++) {
    const title: string = faker.lorem.word();
    const subject = await prisma.subject.create({
      data: {
        name: title,
        slug: slug(title),
        minors: { connect: { id: minor.id } },
      },
    });
    await prisma.document.create({
      data: {
        description: faker.lorem.paragraph({ min: 2, max: 10 }),
        title: 'Un document',
        slug: 'un-document',
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

console.info('Creating groups');
for (const [i, group] of tqdm([...clubsData.entries()])) {
  const uid = slug(group.name)
  const { id: groupId } = await prisma.group.create({
    data: {
      ...group,
      uid, 
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
      longDescription: faker.lorem.paragraphs({ min: 0, max: 5 }),
      studentAssociation: { connect: { id: faker.helpers.arrayElement(studentAssociations).id } },
      links: {
        createMany: {
          data: faker.helpers.arrayElements(socialMedia, {min: 0, max: 6}).map(domain => ({name: domain, value: `https://${domain}/${uid}`})),
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
  if (faker.datatype.boolean(0.8)) {
    await downloadRandomImage(400, 400, uid)
      .then(async (file) =>
        prisma.group.update({
          where: { id: groupId },
          data: {
            pictureFile: await updatePicture({
              extension: 'png',
              folder: 'groups',
              identifier: uid,
              resource: 'group',
              file,
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

let IntégrationGroup = await prisma.group.create({
  data: {
    name: `Intégration ${new Date().getFullYear()}`,
    type: GroupType.Group,
    uid: `integration-${new Date().getFullYear()}`,
    color: '#ff0000',
    links: { create: [] },
    studentAssociation: { connect: { id: faker.helpers.arrayElement(studentAssociations).id } },
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
    studentAssociation: { connect: { id: faker.helpers.arrayElement(studentAssociations).id } },
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
for (const element of tqdm(selectedClub)) {
  const eventName = faker.lorem.words(3);
  const capacityEvent = faker.number.int({ min: 30, max: 300 });
  const { id } = await prisma.event.create({
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
      group: { connect: { id: element!.id } },
      visibility: Visibility.Public,
      articles: {
        createMany: {
          data: [
            {
              body: "Ceci est un article d'événement",
              groupId: element!.id,
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
              slug: `event-${element!.uid}`,
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
for (const i of tqdm([...range(0, 100)])) {
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
      ...(i % 4 === 0
        ? { externalBeneficiary: 'whatcoubeh' }
        : { internalBeneficiaryId: faker.helpers.arrayElement(users).id }),
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
    slug: `${clubForBarWeek.name}-2023`,
    description: `Semaine de bar de ${clubForBarWeek.name}!`,
    groups: {
      connect: [{ uid: clubForBarWeek.uid }],
    },
  },
});

const thirdPartyAppClub = await prisma.group.findUniqueOrThrow({
  where: { uid: faker.helpers.arrayElement(groups).uid },
});

await prisma.shopItem.create({
  data: {
    slug: 'boules-quies',
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
    slug: 'server',
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
    slug: 'rechauffement',
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

for (let i = 0; i < 10; i++) {
  const opensAt = i === 0 ? faker.date.soon() : faker.date.anytime();
  const form = await prisma.form.create({
    data: {
      groupId: faker.helpers.arrayElement(groups).id,
      visibility: randomVisiblity(),
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

exit(0);
