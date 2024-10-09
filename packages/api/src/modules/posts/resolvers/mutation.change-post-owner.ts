import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID, UIDScalar } from '#modules/global';
import { ArticleType, canEditArticle } from '#modules/posts';

builder.mutationField('changePostOwner', (t) =>
  t.prismaField({
    type: ArticleType,
    errors: {},
    description: "Mettre à jour le groupe d'un article",
    args: {
      post: t.arg({ type: LocalID }),
      group: t.arg({ type: UIDScalar }),
    },
    async authScopes(_, { post, group }, { user }) {
      const newGroup = await prisma.group.findUniqueOrThrow({
        where: { uid: group },
        include: canEditArticle.prismaNewGroupIncludes,
      });
      return canEditArticle(
        await prisma.article.findUniqueOrThrow({
          where: { id: ensureGlobalId(post, 'Article') },
          include: canEditArticle.prismaIncludes,
        }),
        { group: newGroup, authorId: null },
        user,
      );
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.post, 'Article');
      await log('post', 'change-owner', args, id, user);

      return prisma.article.update({
        ...query,
        where: { id },
        data: {
          group: { connect: { uid: args.group } },
        },
      });
    },
  }),
);
