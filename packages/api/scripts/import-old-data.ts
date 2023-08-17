/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable unicorn/no-null */
import { type Group, PrismaClient, NotificationType, StudentAssociation } from '@prisma/client';
import { hash } from 'argon2';
import { compareAsc, differenceInYears, parse, parseISO } from 'date-fns';
import { createWriteStream, readFileSync, statSync, writeFileSync } from 'node:fs';
import type * as Ldap from './ldap-types';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';
import { SingleBar } from 'cli-progress';
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

const PORTAIL_LOG_APPLICATION = {
  '11': 'acces_annuaire',
  '12': 'alerte_annuaire',
  '7': 'gestion_accueil',
  '1': 'gestion_alias',
  '9': 'gestion_billetterie',
  '2': 'gestion_clubs',
  '8': 'gestion_ecobox',
  '10': 'gestion_eleves',
  '4': 'gestion_formations',
  '3': 'gestion_groupes',
  '5': 'gestion_permissions',
  '6': 'pages',
} as const;

type PortailLog = {
  id: `${number}`;
  date: iso8601;
  operation: string;
  application_id: keyof typeof PORTAIL_LOG_APPLICATION;
  user_id: `${number}`;
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

async function makeUser(user: OldUser, ldapUser: Ldap.User, ae: StudentAssociation) {
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
      email: ldapUser.mailAnnexe?.[0] ?? ldapUser.mail,
      firstName: user.first_name,
      lastName: user.last_name,
      graduationYear: ldapUser.promo,
      majorId: major.id,
      nickname: ldapUser.nickname ?? '',
      phone: ldapUser.mobile || ldapUser.homePhone,
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
      contributesTo: ldapUser.inscritAE
        ? {
            connect: {
              id: ae.id,
            },
          }
        : undefined,
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
      // console.log(`  Logo of ${ldapGroup.cn} already exists, skipping…`);
    } else {
      const filestream = createWriteStream(dest);
      const url = `https://www.bde.${
        ldapGroup.ecole.displayName?.toLowerCase().replaceAll(' ', '-') ?? 'inp-toulouse'
      }.fr/media/logos-clubs/${ldapGroup.cn}_x224.png`;
      // console.log(`  Downloading ${url} -> ${dest}`);
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

  let memberUids = ldapGroup.memberUid;
  if (ldapGroup.cn === 'tvn7-n7') {
    memberUids = [
      ...memberUids,
      ...LDAP_DATA.groupesInformels.find(({ cn }) => cn === 'tvn7-membres-n7')!.memberUid!,
    ];
  }

  await Promise.all(
    memberUids.map(async (uid) => {
      const member = await prisma.user.findUnique({ where: { uid } });
      if (!member) return;
      const president = ldapGroup.president === uid;
      const secretaryIndex = (ldapGroup.secretaire ?? []).indexOf(uid);
      const vicePresidentIndex = (ldapGroup.vicePresident ?? []).indexOf(uid);
      const treasurerIndex = ldapGroup.tresorier.indexOf(uid);
      const secretary = secretaryIndex > -1;
      const vicePresident = vicePresidentIndex > -1;
      const treasurer = treasurerIndex > -1;
      const bureau = president || secretary || vicePresident || treasurer;

      let title = 'Membre';
      if (president) {
        title = 'Prez';
      } else if (treasurer) {
        title = treasurerIndex === 0 ? 'Trez' : 'Vice-trez';
      } else if (vicePresident) {
        title = (ldapGroup.vicePresident?.length ?? 0) > 1 ? `VP ${vicePresidentIndex + 1}` : 'VP';
      } else if (secretary) {
        title = secretaryIndex === 0 ? 'Secrétaire' : 'Vice-secrétaire';
      }

      try {
        await prisma.groupMember.create({
          data: {
            canEditArticles: bureau,
            canEditMembers: bureau,
            president,
            secretary,
            treasurer,
            vicePresident,
            title,
            group: { connect: { uid: newGroup.uid } },
            member: { connect: { uid } },
            // xxx: assume user joined on december 1st of their first year if not found in logs
            createdAt:
              userJoinedGroupAt(uid, ldapGroup.cn) ?? new Date(member.graduationYear - 3, 12, 1),
          },
        });
      } catch {
        // console.error(`  Could not make ${uid} member of ${ldapGroup.cn}: ${error}`);
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
  } catch {}
}

console.log(`· Loading data from dump files`);
const DATA = JSON.parse(readFileSync('./data.json').toString()) as unknown as Array<
  Record<string, unknown>
>;

const oldUsersPortail = DATA.find(({ type, name }) => type === 'table' && name === 'auth_user')![
  'data'
] as OldUser[];

const oldClubsPortail = DATA.find(({ type, name }) => type === 'table' && name === 'club_club')![
  'data'
] as OldGroup[];

const logsPortail = DATA.find(
  ({ type, name }) => type === 'table' && name === 'portailuser_logentry'
)!['data'] as PortailLog[];
console.log(
  `  Loaded portail dump (${oldUsersPortail.length} users, ${oldClubsPortail.length} clubs, ${logsPortail.length} logs)`
);

const LOG_USER_ADD_TO_GROUP_PATTERN =
  /^A ajouté[^(]*[( ](?<userUid>[\w-]+)\)? au (?:club|groupe) (?<groupUid>[\w-]+)$/;
const logsAddUserToGroup: Array<{ date: Date; userUid: string; groupUid: string }> = logsPortail
  .filter(
    ({ application_id, operation }) =>
      PORTAIL_LOG_APPLICATION[application_id] === 'gestion_clubs' &&
      operation.startsWith('A ajouté') &&
      (operation.includes('au club') || operation.includes('au groupe')) &&
      LOG_USER_ADD_TO_GROUP_PATTERN.test(operation)
  )
  .map(({ operation, date }) => {
    const match = operation.trim().match(LOG_USER_ADD_TO_GROUP_PATTERN)!;
    return {
      date: parseISO(date),
      userUid: match.groups!['userUid']!,
      groupUid: match.groups!['groupUid']! + '-n7',
    };
  })
  .filter((o) => o !== undefined);

function userJoinedGroupAt(userUid: string, groupUid: string): Date | undefined {
  if (groupUid === 'tvn7-n7') {
    const dateGroupeInformel = userJoinedGroupAt(userUid, 'tvn7-membres-n7');
    if (dateGroupeInformel) return dateGroupeInformel;
  }
  const allAdds = logsAddUserToGroup.filter(
    (log) => log.userUid === userUid && log.groupUid === groupUid
  );
  if (allAdds.length === 0) {
    // console.log(`${userUid} @ ${groupUid}: No logs found to get join date`)
    return undefined;
  }

  // if (allAdds.length > 1) console.log(`${userUid} @ ${groupUid}: Taking add log out of ${allAdds.length} logs`)
  return allAdds.sort((a, b) => compareAsc(a.date, b.date))[0]?.date;
}

const CAS_DATA = JSON.parse(readFileSync('./cas-data.json').toString()) as unknown as Array<
  Record<string, unknown>
>;
const oldUsersCAS = CAS_DATA.find(({ type, name }) => type === 'table' && name === 'auth_user')![
  'data'
] as Array<{ last_login: iso8601; username: string }>;

console.log(`  Loaded CAS dump (${oldUsersCAS.length} users)`);

let LDAP_DATA = JSON.parse(
  readFileSync('./dump-ldap.json').toString()
) as unknown as Ldap.LDAPTypes;

console.log(
  `  Loaded LDAP dump (${LDAP_DATA.users.length} users, ${LDAP_DATA.clubs.length} clubs, ${LDAP_DATA.majors.length} majors, ${LDAP_DATA.schools.length} schools)`
);
console.log('');

let count = 0;
console.log(`· Deleting old data`);
({ count } = await prisma.user.deleteMany({}));
console.log(`  ${count} users`);
({ count } = await prisma.userCandidate.deleteMany());
console.log(`  ${count} user candidates`);
({ count } = await prisma.article.deleteMany());
console.log(`  ${count} articles`);
({ count } = await prisma.ticketGroup.deleteMany());
console.log(`  ${count} ticket groups`);
({ count } = await prisma.ticket.deleteMany());
console.log(`  ${count} tickets`);
({ count } = await prisma.event.deleteMany());
console.log(`  ${count} events`);
({ count } = await prisma.group.deleteMany());
console.log(`  ${count} groups`);
({ count } = await prisma.studentAssociation.deleteMany({}));
console.log(`  ${count} student associations`);
({ count } = await prisma.school.deleteMany({}));
console.log(`  ${count} schools`);
({ count } = await prisma.major.deleteMany({}));
console.log(`  ${count} majors`);

console.log('');

console.log(
  `· Removing inactive users (where last login was more than 3 years ago) from loaded LDAP dump`
);
const oldCount = LDAP_DATA.users.length;
LDAP_DATA = {
  ...LDAP_DATA,
  users: LDAP_DATA.users.filter((user) => {
    const casUser = oldUsersCAS.find((u) => u.username === user.uid);
    if (!casUser) return false;

    return differenceInYears(new Date(), parseISO(casUser.last_login)) <= 3;
  }),
};
console.log(`  Removed ${oldCount - LDAP_DATA.users.length} users`);

function findConflictsInSchoolEmails() {
  const emails = new Set<string>();
  const conflicts = new Set<string>();

  for (const user of LDAP_DATA.users) {
    if (!user.mailEcole) continue;
    if (emails.has(user.mailEcole)) conflicts.add(user.mailEcole);
    else emails.add(user.mailEcole);
  }

  return conflicts;
}

// Fix weird conflict
LDAP_DATA.users = LDAP_DATA.users.map((u) => {
  if (u.uid === 'diont') {
    return {
      ...u,
      mailEcole: u.mailEcole.replace('2', '').replace('@etu.inp-n7.fr', '@etu.inp-ensiacet.fr'),
    };
  }
  return u;
});

const conflicts = findConflictsInSchoolEmails();

if (conflicts.size > 0) {
  const usersInConflict = LDAP_DATA.users.filter((u) => conflicts.has(u.mailEcole));
  console.log();
  console.log(`· Found ${conflicts.size} conflicts in school emails:`);
  const usersInConflictBySchoolMail: Record<string, Ldap.User[]> = {};
  for (const user of usersInConflict) {
    if (!user.mailEcole) continue;
    if (!usersInConflictBySchoolMail[user.mailEcole])
      usersInConflictBySchoolMail[user.mailEcole] = [];
    usersInConflictBySchoolMail[user.mailEcole]!.push(user);
  }

  for (const [email, users] of Object.entries(usersInConflictBySchoolMail)) {
    console.log(`  ${email}:`);
    for (const u of users) {
      console.log(`    - @${u.uid} [${u.ecole.o}, ${u.promo}] (${u.mailAnnexe?.join(', ') ?? ''})`);
    }
    console.log();
  }
  if (usersInConflict.some((u) => u.ecole.o === 'n7')) {
    console.log();
    console.log('  Some of these users are at n7, stopping.');
    process.exit(1);
  }
}

function progressbar(objectName: string, total: number): SingleBar {
  console.log('');
  console.log('');
  console.log(`· Creating ${total} ${objectName}`);
  const bar = new SingleBar({
    format: `  {percentage}% {bar} {value} ${objectName} created ({eta_formatted})`,
    hideCursor: true,
  });
  bar.start(total, 0);

  return bar;
}

let bar = progressbar('schools', LDAP_DATA.schools.length);
for (const oldSchool of LDAP_DATA.schools) {
  const school = await makeSchool(oldSchool);
  if (!school) continue;
  bar.increment();
}

bar = progressbar('AEs', 1);
const AEn7 = await prisma.studentAssociation.create({
  data: {
    name: 'AEn7',
    school: {
      connect: {
        id: (await prisma.school.findFirstOrThrow({ where: { name: 'ENSEEIHT' } })).id,
      },
    },
  },
});
bar.increment();
bar.stop();

bar.stop();
bar = progressbar('majors', LDAP_DATA.majors.length);
for (const oldMajor of LDAP_DATA.majors) {
  await makeMajor(oldMajor);
  bar.increment();
}

const errors: {
  users: Array<{ user: Ldap.User; error: unknown }>;
  clubs: Array<{ club: Ldap.Club; error: unknown }>;
} = {
  users: [],
  clubs: [],
};

bar.stop();
bar = progressbar('users', LDAP_DATA.users.length);
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
    await makeUser(oldUserPortail, oldUser, AEn7);
    bar.increment();
  } catch (error: unknown) {
    errors.users.push({ user: oldUser, error });
  }
}

bar.stop();
bar = progressbar('godparent relations', LDAP_DATA.users.length);
for (const user of LDAP_DATA.users) {
  await connectGodparent(user);
  bar.increment();
}

bar.stop();
bar = progressbar('groups', LDAP_DATA.clubs.length);
for (const oldGroup of LDAP_DATA.clubs) {
  const portailClub = oldClubsPortail.find(
    ({ ident, ecole_id }) => `${ident}-${SCHOOLS[ecole_id].uid}` === oldGroup.cn
  );
  try {
    await makeGroup(portailClub!, oldGroup);
    bar.increment();
  } catch (error: unknown) {
    errors.clubs.push({ club: oldGroup, error });
  }
}

bar.stop();
console.log('');

if (errors.clubs.length + errors.users.length > 0) {
  console.log(
    `Failed to create ${errors.clubs.length} clubs and ${errors.users.length} users (including ${
      errors.users.filter((u) => u.user.ecole.o === 'n7').length
    } at n7)`
  );
  writeFileSync('./import-errors.json', JSON.stringify(errors));
}
