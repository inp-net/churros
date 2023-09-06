import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const p = new PrismaClient();

const integrationGroups = [] as Array<{
  respos: Array<{ firstName: string; lastName: string }>;
  members: Array<{
    firstName: string;
    lastName: string;
    promo: 'SN' | 'MFEE' | '3EA';
    apprentice: boolean;
  }>;
}>;

function unaccent(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function prismaSearchByName(first: string, last: string) {
  return {
    AND: [
      { OR: [{ firstName: { search: first } }, { firstName: { search: unaccent(first) } }] },
      { OR: [{ lastName: { search: last } }, { lastName: { search: unaccent(last) } }] },
    ],
  };
}

let currentGroup = -1;
for (const line of readFileSync('./integration-2as.tsv').toString().split('\n')) {
  currentGroup++;
  integrationGroups[currentGroup] = {
    respos: [],
    members: [],
  };
  for (const fullname of line.split('\t')) {
    const [firstName, lastName] = fullname
      .split(fullname.includes(',') ? ',' : ' ')
      .map((s) => s.trim()) as [string, string];
    integrationGroups[currentGroup]!.respos.push({
      firstName,
      lastName,
    });
  }
}

for (const line of readFileSync('./integration-1as.tsv').toString().split('\n')) {
  const [group, lastName, firstName, promo] = line.split('\t').map((s) => s.trim()) as [
    string,
    string,
    string,
    string
  ];
  currentGroup = Number.parseInt(group!, 10);
  integrationGroups[currentGroup - 1]?.members.push({
    firstName,
    lastName,
    promo: promo?.includes('SN') ? 'SN' : promo?.includes('MFEE') ? 'MFEE' : '3EA',
    apprentice: promo?.includes('FISA'),
  });
}

for (const [index, group] of Object.entries(integrationGroups)) {
  const number = Number.parseInt(index, 10)! + 1;
  if (number > 10) {
    break;
  }
  console.log(`Création du groupe d'inté ${number}...`);
  const { id, uid } = await p.group.create({
    data: {
      name: `Groupe ${number} 2023`,
      type: 'Integration',
      uid: `inte-2023-${number}`,
      color: '#000000',
      school: {
        connect: {
          uid: 'n7',
        },
      },
    },
  });
  console.log(`\tgroupe d'inté ${number} créé -> https://churros.inpt.fr/groups/${uid}`);
  console.log(`\t(id=${id})`);

  console.log('\t-------- Respos --------');

  for (const { firstName, lastName } of group.respos) {
    try {
      const user = await p.user.findFirst({
        where: {
          ...prismaSearchByName(firstName, lastName),
        },
      });
      if (!user) {
        console.log(`\t❌ respo ${firstName} ${lastName}: non trouvé`);
        continue;
      }

      await p.groupMember.create({
        data: {
          group: { connect: { id } },
          member: {
            connect: {
              id: user.id,
            },
          },
          title: 'Respo',
          vicePresident: true,
          canEditMembers: true,
          canEditArticles: true,
          canScanEvents: true,
        },
      });
      console.log(`\t✅ respo @${user.uid} ${firstName} ${lastName}`);
    } catch (error) {
      console.log(`\t❌ respo ${firstName} ${lastName}: erreur`);
    }
  }
  console.log('\t------- 1As ---------');
  for (const { firstName, lastName, apprentice, promo } of group.members) {
    try {
      const user = await p.user.findFirst({
        where: {
          ...prismaSearchByName(firstName, lastName),
          apprentice,
          major: {
            shortName: promo,
          },
        },
      });
      if (!user) {
        console.log(
          `\t❌ 1A ${firstName} ${lastName} (${promo} ${apprentice ? 'FISA' : ''}): non trouvé`
        );
        continue;
      }
      await p.groupMember.create({
        data: {
          group: { connect: { id } },
          member: {
            connect: {
              id: user.id,
            },
          },
          title: 'Jeune 1A',
        },
      });
      console.log(
        `\t✅ 1A @${user.uid} ${firstName} ${lastName} (${promo}${apprentice ? ' FISA' : ''})`
      );
    } catch (error) {
      console.log(
        `\t❌ 1A ${firstName} ${lastName} (${promo} ${apprentice ? 'FISA' : ''}): erreur`
      );
    }
  }
}
