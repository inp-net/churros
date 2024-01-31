import { prisma } from '#lib';
import dichotomid from 'dichotomid';
import slug from 'slug';

export async function createUid({ title, groupId }: { title: string; groupId: string }) {
  const base = slug(title);
  const n = await dichotomid(
    async (n) =>
      !(await prisma.article.findUnique({
        where: { groupId_uid: { groupId, uid: `${base}${n > 1 ? `-${n}` : ''}` } },
      })),
  );
  return `${base}${n > 1 ? `-${n}` : ''}`;
}
