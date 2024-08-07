import type { Prisma } from "@churros/db/prisma";

export function prismaQueryCanCreateGroupsOn(user: {
  id: string;
}): Prisma.StudentAssociationWhereInput {
  return {
    OR: [{ admins: { some: { id: user.id } } }],
  };
}
