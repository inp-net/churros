import type { PrismaClient } from '@churros/db/prisma';
import { syncLdapSchools } from '@inp-net/ldap7/school';

const sync = async (client: PrismaClient) => {
  const schools = await client.school.findMany({
    select: {
      uid: true,
    },
  });

  await syncLdapSchools(schools.map((school) => school.uid));
};

export default { sync };
