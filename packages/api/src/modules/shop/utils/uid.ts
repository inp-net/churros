import { prisma } from '#lib';
import dichotomid from 'dichotomid';
import slug from 'slug';

export async function createUid({ title, groupId }: { title: string; groupId: string }) {
  const base = slug(title);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.shopItem.findUnique({
        where: { groupId_slug: { groupId, slug: `${base}${n > 1 ? `-${n}` : ''}` } },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}
