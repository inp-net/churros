import { prisma, type Context } from '#lib';
import type { Service } from '@churros/db/prisma';

export async function serviceIsPinnedByUser(service: Service, user: Context['user']) {
  if (!user) return false;
  return prisma.bookmark
    .findUnique({
      where: {
        userId_path: {
          userId: user.id,
          path: service.id,
        },
      },
    })
    .then(Boolean);
}
