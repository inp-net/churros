import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID, UIDScalar } from '#modules/global';
import { canCreatePostsOn } from '#modules/groups';
import { ArticleType } from '#modules/posts/types';
import slug from 'slug';

builder.mutationField('createPost', (t) =>
  t.prismaField({
    type: ArticleType,
    description: 'Créer un post en privé',
    errors: {},
    args: {
      title: t.arg.string({
        defaultValue: '',
      }),
      body: t.arg.string({ defaultValue: '' }),
      group: t.arg({
        type: UIDScalar,
      }),
      event: t.arg({
        type: LocalID,
      }),
    },
    async authScopes(_, args, { user }) {
      return (
        canEditEvent(
          await prisma.event.findUniqueOrThrow({
            where: {
              id: ensureGlobalId(args.event, 'Event'),
            },
            include: canEditEventPrismaIncludes,
          }),
          user,
        ) ||
        canCreatePostsOn(
          user,
          await prisma.group.findUniqueOrThrow({
            where: {
              uid: args.group,
            },
            include: canCreatePostsOn.prismaIncludes,
          }),
        )
      );
    },
    async resolve(query, _, args, { user }) {
      const id = args.event ? ensureGlobalId(args.event, 'Event') : null;
      await log('posts', 'create-on-event', args, id, user);
      return prisma.article.create({
        ...query,
        data: {
          title: args.title,
          body: args.body,
          slug: slug(args.title),
          group: { connect: { uid: args.group } },
          event: id ? { connect: { id } } : undefined,
        },
      });
    },
  }),
);
