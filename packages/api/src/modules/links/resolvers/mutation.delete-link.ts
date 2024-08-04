import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { LinkType } from '#modules/links/types';
import { ZodError } from 'zod';
import { canEditLink, canEditLinkPrismaIncludes } from '../utils/permissions.js';

builder.mutationField('deleteLink', (t) =>
  t.prismaField({
    type: LinkType,
    errors: { types: [Error, ZodError] },
    description: 'Supprimer un lien existant',
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, args, { user }) {
      const link = await prisma.link.findUniqueOrThrow({
        where: { id: ensureGlobalId(args.id, 'Link') },
        include: canEditLinkPrismaIncludes,
      });
      return canEditLink(user, link);
    },
    async resolve(query, _, { id }, { user }) {
      id = ensureGlobalId(id, 'Link');
      const { eventId, articleId } = await prisma.link.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Link') },
        select: { eventId: true, articleId: true },
      });
      await log(eventId ? 'events' : 'posts', 'delete-link', { id }, eventId ?? articleId, user);
      return prisma.link.delete({
        ...query,
        where: { id },
      });
    },
  }),
);
