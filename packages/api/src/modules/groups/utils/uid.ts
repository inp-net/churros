import { prisma } from '#lib';
import dichotomid from 'dichotomid';
import slug from 'slug';

export async function createGroupUid(name: string) {
  const groupSlug = slug(name);
  const createUid = (i: number) => (i === 1 ? groupSlug : `${groupSlug}-${i}`);
  const i = await dichotomid(
    async (i) => !(await prisma.group.findFirst({ where: { uid: createUid(i) } })),
  );
  return createUid(i);
}
