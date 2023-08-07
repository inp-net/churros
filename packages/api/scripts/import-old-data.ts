/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable unicorn/no-null */
import { type Group, PrismaClient, NotificationType } from '@prisma/client';
import { hash } from 'argon2';
import { parse, parseISO } from 'date-fns';
import { createWriteStream, readFileSync, statSync, writeFileSync } from 'node:fs';
import type * as Ldap from './ldap-types';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';
const prisma = new PrismaClient();

const hashedA = await hash('a');
type tinyIntString = '1' | '0';
type iso8601 =
  | `${number}-${number}-${number}`
  | `${number}-${number}-${number} ${number}:${number}:${number}`;
type bbcode = string;

function bbcode2markdown(text: bbcode): string {
  return (
    text
      .replaceAll('\0', '')
      // .replaceAll(/\r?\n/gi, '\n')
      .replaceAll(/\[b](.*?)\[\/b]/gi, (_, $1: string) => `**${$1.trim()}**`)
      .replaceAll(/\[i](.*?)\[\/i]/gi, (_, $1: string) => `*${$1.trim()}*`)
      .replaceAll(/\[u](.*?)\[\/u]/gi, (_, $1: string) => `*${$1.trim()}*`)
      .replaceAll(/\[s](.*?)\[\/s]/gi, (_, $1: string) => `~~${$1.trim()}~~`)
      .replaceAll(/\[url=(.*?)](.*?)\[\/url]/gi, '[$2]($1)')
      .replaceAll(/\[url](.*?)\[\/url]/gi, (_, $1: string) => `<${$1.trim()}>`)
      .replaceAll(/\[img](.*?)\[\/img]/gi, '![]($1)')
      .replaceAll(/\[color=(.*?)](.*?)\[\/color]/gi, '$2')
      .replaceAll(/\[quote](.*?)\[\/quote]/gi, (_, $1) =>
        ($1 as string)
          .split('\n')
          .map((line: string) => `> ${line}`)
          .join('\n')
      )
      .replaceAll(/\[list]/gi, '\n')
      .replaceAll(/\[\/list]/gi, '\n')
      .replaceAll(/\[\*]/gi, '- ')
      .replaceAll(/\[\/\*]/gi, '')
      .replaceAll(/\[size=(.+?)](.+?)\[\/size]/gi, '$2')
      .replaceAll(/\[br]/gi, '\n\n')
      .replaceAll(
        /\[h([1-6])](.+?)\[\/h([1-6])]/gi,
        (_, level, text) =>
          `${'#'.repeat(Number.parseFloat(level as `${number}`))} ${text as string}\n`
      )
  );
}

type ecoleId = '1' | '2' | '3' | '4' | '5';

const SCHOOLS: Record<ecoleId, { uid: string; name: string }> = {
  1: { uid: 'inp', name: 'Toulouse INP' },
  2: { uid: 'n7', name: 'ENSEEIHT' },
  3: { uid: 'ensat', name: 'ENSAT' },
  4: { uid: 'a7', name: 'ENSIACET' },
  5: { uid: 'enm', name: 'ENM' },
};

type OldUser = {
  is_superuser: tinyIntString;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: tinyIntString;
  date_joined: iso8601;
};

type OldGroup = {
  ident: string;
  mini_description: string;
  description: bbcode;
  nom: string;
  logo: string;
  ecole_id: ecoleId;
};

function bool(tinyIntString: tinyIntString): boolean {
  switch (tinyIntString) {
    case '1': {
      return true;
    }

    case '0': {
      return false;
    }

    default: {
      throw new Error(`Tried converting to boolean, which is neither "1" nor "0"`);
    }
  }
}

async function makeSchool(school: Ldap.School) {
  if (!school.displayName || !school.o) {
    console.log(`WARN: No name or no uid; skipping making school for ${JSON.stringify(school)}`);
    return;
  }

  return prisma.school.create({
    data: {
      color: '#ffffff',
      name: school.displayName,
      uid: school.o,
    },
  });
}

async function makeMajor(major: Ldap.Major) {
  return prisma.major.create({
    data: {
      name: major.displayName,
      shortName: major.shortName,
      schools: {
        connect: [
          {
            uid: major.ecole.o,
          },
        ],
      },
    },
  });
}

async function makeUser(user: OldUser, ldapUser: Ldap.User) {
  const major = await prisma.major.findFirstOrThrow({
    where: {
      name: ldapUser.filiere.displayName,
    },
  });
  return prisma.user.create({
    data: {
      address: ldapUser.postalAddress ?? '',
      admin: bool(user.is_superuser),
      birthday: parse(ldapUser.birthdate as unknown as string, 'yyyy-MM-dd', new Date()),
      canEditGroups: bool(user.is_staff),
      canEditUsers: bool(user.is_staff),
      createdAt: parseISO(user.date_joined),
      description: '',
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      graduationYear: ldapUser.promo,
      majorId: major.id,
      nickname: '',
      phone: ldapUser.homePhone,
      pictureFile: fileExists(`../storage/users/${user.username}.jpeg`)
        ? `users/${user.username}.jpeg`
        : '',
      schoolEmail: ldapUser.mailEcole,
      schoolServer: 'inp',
      schoolUid: user.username,
      uid: user.username,
      credentials: {
        create: {
          type: 'Password',
          value: hashedA,
        },
      },
      links: { create: [] },
      notificationSettings: {
        create: Object.values(NotificationType).map((type) => ({
          type,
          allow: true,
        })),
      },
    },
  });
}

function fileExists(filename: string): boolean {
  try {
    return statSync(filename).isFile();
  } catch {
    return false;
  }
}

async function makeGroup(group: OldGroup, ldapGroup: Ldap.Club) {
  const typeClub: Record<Ldap.TypeClub, Group['type']> = {
    asso: 'Association',
    club: 'Club',
  };
  if (group.logo) {
    const dest = `../storage/groups/${ldapGroup.cn}.png`;
    if (fileExists(dest)) {
      console.log(`  Logo of ${ldapGroup.cn} already exists, skipping…`);
    } else {
      const filestream = createWriteStream(dest);
      const url = `https://www.bde.${
        ldapGroup.ecole.displayName?.toLowerCase().replaceAll(' ', '-') ?? 'inp-toulouse'
      }.fr/media/logos-clubs/${ldapGroup.cn}_x224.png`;
      console.log(`  Downloading ${url} -> ${dest}`);
      try {
        const { body } = await fetch(url);
        if (body === null) group.logo = '';
        else await finished(Readable.fromWeb(body as ReadableStream).pipe(filestream));
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`  Failed to download ${url}: ${error}`);
        group.logo = '';
      }
    }
  }

  const newGroup = await prisma.group.create({
    data: {
      address: ldapGroup.local ?? '',
      color: '#ffffff',
      description: group.mini_description,
      longDescription: bbcode2markdown(group.description),
      email: ldapGroup.mailAlias?.[0] ?? '',
      familyId: null,
      groupId: '',
      name: group.nom,
      parentId: null,
      pictureFile: group.logo ? `groups/${ldapGroup.cn}.png` : '',
      schoolId: (await prisma.school.findUniqueOrThrow({ where: { uid: ldapGroup.ecole.o } })).id,
      selfJoinable: false,
      studentAssociationId: null,
      type: ldapGroup.activite === 'liste' ? 'List' : typeClub[ldapGroup.typeClub ?? 'club'],
      uid: ldapGroup.cn,
    },
  });

  await prisma.group.update({ where: { id: newGroup.id }, data: { familyId: newGroup.id } });

  await Promise.all(
    ldapGroup.memberUid.map(async (uid) => {
      const president = ldapGroup.president === uid;
      const secretary = (ldapGroup.secretaire ?? []).includes(uid);
      const vicePresident = (ldapGroup.vicePresident ?? []).includes(uid);
      const treasurer = ldapGroup.tresorier.includes(uid);
      const bureau = president || secretary || vicePresident || treasurer;
      try {
        await prisma.groupMember.create({
          data: {
            canEditArticles: bureau,
            canEditMembers: bureau,
            president,
            secretary,
            treasurer,
            vicePresident,
            title: president
              ? 'Prez'
              : treasurer
              ? 'Trez'
              : vicePresident
              ? 'VP'
              : secretary
              ? 'Secrétaire'
              : 'Membre',
            group: { connect: { uid: newGroup.uid } },
            member: { connect: { uid } },
          },
        });
      } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.error(`  Could not make ${uid} member of ${ldapGroup.cn}: ${error}`);
      }
    })
  );

  return prisma.group.findUniqueOrThrow({
    where: { uid: newGroup.uid },
    include: {
      members: true,
    },
  });
}

async function connectGodparent(user: Ldap.User) {
  if (!user.uidParrain) return;

  try {
    await prisma.user.update({
      where: { uid: user.uid },
      data: {
        godparent: {
          connect: {
            uid: user.uidParrain,
          },
        },
      },
    });
    console.log(`· Connected godparent: ${user.uid} -> ${user.uidParrain}`);
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`· Could not connect godparent ${user.uid} -> ${user.uidParrain}: ${error}`);
  }
}

const DATA = JSON.parse(readFileSync('./data.json').toString()) as unknown as Array<
  Record<string, unknown>
>;

const oldUsersPortail = DATA.find(({ type, name }) => type === 'table' && name === 'auth_user')![
  'data'
] as OldUser[];

const oldClubsPortail = DATA.find(({ type, name }) => type === 'table' && name === 'club_club')![
  'data'
] as OldGroup[];
console.log(
  `· Loaded portail dump (${oldUsersPortail.length} users, ${oldClubsPortail.length} clubs)`
);

const LDAP_DATA = JSON.parse(
  readFileSync('./dump-ldap.json').toString()
) as unknown as Ldap.LDAPTypes;

console.log(
  `· Loaded LDAP dump (${LDAP_DATA.users.length} users, ${LDAP_DATA.clubs.length} clubs, ${LDAP_DATA.majors.length} majors, ${LDAP_DATA.schools.length} schools)`
);

await prisma.user.deleteMany({});
await prisma.userCandidate.deleteMany();
await prisma.article.deleteMany();
await prisma.event.deleteMany();
await prisma.group.deleteMany();
await prisma.studentAssociation.deleteMany({});
await prisma.school.deleteMany({});
await prisma.major.deleteMany({});

for (const oldSchool of LDAP_DATA.schools) {
  const school = await makeSchool(oldSchool);
  if (!school) continue;
  console.log(`· Created ${school.name} (@${school.uid})`);
}

for (const oldMajor of LDAP_DATA.majors) {
  const major = await makeMajor(oldMajor);
  console.log(`· Created major ${major.name}`);
}

const errors: {
  users: Array<{ user: Ldap.User; error: unknown }>;
  clubs: Array<{ club: Ldap.Club; error: unknown }>;
} = {
  users: [],
  clubs: [],
};

for (const oldUser of LDAP_DATA.users) {
  const oldUserPortail = oldUsersPortail.find(({ username }) => username === oldUser.uid) ?? {
    username: oldUser.uid,
    last_name: oldUser.sn,
    first_name: oldUser.givenName,
    email: oldUser.mail,
    is_superuser: '0',
    is_staff: '0',
    date_joined: '2023-01-01 00:00:00',
  };
  try {
    const user = await makeUser(oldUserPortail, oldUser);
    console.log(
      `· Created [${user.graduationYear}] ${user.firstName} ${user.lastName} (@${user.uid})`
    );
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`· Failed to create ${oldUser.displayName} (@${oldUser.uid}): ${error}`);
    errors.users.push({ user: oldUser, error });
  }
}

for (const user of LDAP_DATA.users) await connectGodparent(user);

for (const oldGroup of LDAP_DATA.clubs) {
  const portailClub = oldClubsPortail.find(
    ({ ident, ecole_id }) => `${ident}-${SCHOOLS[ecole_id].uid}` === oldGroup.cn
  );
  try {
    const group = await makeGroup(portailClub!, oldGroup);
    console.log(`· Created ${group.name} (@${group.uid}) (${group.members.length} members)`);
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`· Failed to create group ${oldGroup.displayName} (@${oldGroup.cn}): ${error}`);
    errors.clubs.push({ club: oldGroup, error });
  }
}

if (errors.clubs.length + errors.users.length > 0) {
  console.log(`Failed to create ${errors.clubs.length} clubs and ${errors.users.length} users`);
  writeFileSync('./import-errors.json', JSON.stringify(errors));
}
