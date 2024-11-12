import { builder } from '#lib';
import { CommentType } from '#modules/comments/types';
import { LocalID } from '#modules/global';

builder.queryField('comment', (t) =>
  t.prismaField({
    type: CommentType,
    nullable: true,
    description: 'Récupérer un commentaire',
    args: {
      id: t.arg({ type: LocalID }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { id }) {
      return prisma.comment.findUnique({
        ...query,
        where: { id },
      });
    },
  }),
);
