import { builder, ensureGlobalId, log, prisma } from '#lib';
import { ArticleType } from '#modules/posts/types';
import { canEditArticle } from '#modules/posts/utils';

builder.mutationField('unlinkEventFromPost', (t) =>
  t.prismaField({
    type: ArticleType,
    errors: {},
    description: 'Détacher un post de son événement',
    args: {
      post: t.arg({ type: 'LocalID' }),
    },
    async authScopes(_, { post }, { user }) {
      return canEditArticle(
        await prisma.article.findUniqueOrThrow({
          where: { id: ensureGlobalId(post, 'Article') },
          include: canEditArticle.prismaIncludes,
        }),
        { group: null, authorId: null },
        user,
      );
    },
    async resolve(query, _, { post }, { user }) {
      const id = ensureGlobalId(post, 'Article');
      await log('post', 'unlink-event', { post }, id, user);

      return prisma.article.update({
        ...query,
        where: { id },
        data: {
          event: { disconnect: true },
        },
      });
    },
  }),
);
