import { builder, ensureGlobalId, log, prisma, publish } from '#lib';
import { LocalID } from '#modules/global';
import { ArticleType, canEditArticle } from '#modules/posts';

builder.mutationField('deleteArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    errors: {},
    description: 'Supprimer un post',
    args: { id: t.arg({ type: LocalID }) },
    async authScopes(_, { id }, { user }) {
      const post = await prisma.article.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Article') },
        include: canEditArticle.prismaIncludes,
      });
      return canEditArticle(post, { authorId: null, group: null }, user);
    },
    async resolve(query, _, { id }, { user }) {
      id = ensureGlobalId(id, 'Article');

      await log('article', 'delete', { message: `Article ${id} deleted` }, id, user);

      const result = await prisma.article.delete({ ...query, where: { id } });

      publish(id, 'deleted', id);

      return result;
    },
  }),
);
