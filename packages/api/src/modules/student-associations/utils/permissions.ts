export function prismaQueryCanCreateGroupsOn(user: {
  id: string;
}): Prisma.StudentAssociationWhereInput {
  return {
    OR: [{ admins: { some: { id: user.id } } }],
  };
}
