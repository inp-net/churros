import type { PrismaClient } from '@churros/db/prisma';
import { type LdapGroup, syncLdapGroups } from '@inp-net/ldap7/group';

type Group = {
  uid: string;
  ldapGidNumber: number;
  studentAssociation: {
    school: {
      uid: string;
    };
  };
  members: {
    member: {
      uid: string;
    };
  }[];
};

const prismaGroupQuery = {
  select: {
    uid: true,
    ldapGidNumber: true,
    studentAssociation: {
      select: {
        school: {
          select: {
            uid: true,
          },
        },
      },
    },
    members: {
      select: {
        member: {
          select: {
            uid: true,
          },
        },
      },
    },
  },
};

const mapGroup = (group: Group): LdapGroup => ({
  name: group.uid,
  gidNumber: group.ldapGidNumber,
  school: group.studentAssociation.school.uid,
  members: group.members.map((member) => member.member.uid),
});

const sync = async (client: PrismaClient) => {
  const groups: Group[] = await client.group.findMany(prismaGroupQuery);

  await syncLdapGroups(groups.map((group) => mapGroup(group)));
};

export default { sync };
