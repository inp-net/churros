import type { Prisma, PrismaClient, User } from '@churros/db/prisma';
import { type LdapUser, syncLdapUsers } from '@inp-net/ldap7/user';

type UserQuery = { major: { schools: { uid: string }[] } | null } & User;

const prismaUserQuery = {
  include: {
    major: {
      select: {
        schools: {
          select: {
            uid: true,
          },
        },
      },
    },
  },
} satisfies Prisma.UserFindManyArgs;

const mapUser = (user: UserQuery): LdapUser => ({
  uid: user.uid,
  firstName: user.firstName,
  lastName: user.lastName,
  email: [user.email, ...user.otherEmails],
  // picture: user.pictureFile,
  school: user.major?.schools.map((school) => school.uid) ?? [],
  sshKeys: [],
});

const sync = async (client: PrismaClient) => {
  const users: UserQuery[] = await client.user.findMany(prismaUserQuery);

  await syncLdapUsers(users.flatMap((user) => mapUser(user)));
};

export default { sync };
