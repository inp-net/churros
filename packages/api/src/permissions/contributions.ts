import { prisma } from '#lib';
import type { Prisma } from '@prisma/client';

export async function getUserWithContributesTo(
  userId: string,
  query: {
    include?: Prisma.UserInclude;
    select?: Prisma.UserSelect;
  } = {},
) {
  return await prisma.user.findUniqueOrThrow({
    ...query,
    where: { id: userId },
    include: {
      groups: {
        include: { group: true },
      },
      major: {
        include: {
          schools: true,
        },
      },
      contributions: {
        include: {
          option: {
            include: {
              offeredIn: true,
              paysFor: {
                include: {
                  school: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
