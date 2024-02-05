import { prisma, type Context } from '#lib';

export async function userCanEditApp(
  _: unknown,
  { id }: { id: string },
  { user }: { user?: Context['user'] | undefined },
) {
  if (!user) return false;
  if (user.admin) return true;

  return Boolean(
    await prisma.thirdPartyApp.count({
      where: {
        id,
        owner: {
          members: {
            some: {
              member: { id: user.id },
              OR: [
                {
                  president: true,
                },
                {
                  vicePresident: true,
                },
                {
                  secretary: true,
                },
                {
                  treasurer: true,
                },
              ],
            },
          },
        },
      },
    }),
  );
}
