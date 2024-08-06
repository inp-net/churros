import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID, LooseURL } from '#modules/global';
import { LinkType } from '#modules/links/types';
import { ZodError } from 'zod';
import { canEditLink, canEditLinkPrismaIncludes } from '../utils/permissions.js';

builder.mutationField('updateLink', (t) =>
  t.prismaField({
    type: LinkType,
    errors: { types: [Error, ZodError] },
    description: 'Mettre à jour un lien existant',
    args: {
      id: t.arg({ type: LocalID }),
      text: t.arg.string({ required: false, description: 'Texte à afficher pour le lien' }),
      url: t.arg({ required: false, type: LooseURL }),
    },
    validate: [
      [
        ({ text, url }) => Boolean(text || url),
        { message: 'Il faut modifier au moins le texte du lien ou son adresse' },
      ],
    ],
    async authScopes(_, args, { user }) {
      const link = await prisma.link.findUniqueOrThrow({
        where: { id: ensureGlobalId(args.id, 'Link') },
        include: canEditLinkPrismaIncludes,
      });
      return canEditLink(user, link);
    },
    async resolve(query, _, { id, ...link }, { user }) {
      id = ensureGlobalId(id, 'Link');
      const { eventId, articleId } = await prisma.link.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Link') },
        select: { eventId: true, articleId: true },
      });
      await log(
        eventId ? 'events' : 'posts',
        'update-link',
        { id, link },
        eventId ?? articleId,
        user,
      );
      return prisma.link.update({
        ...query,
        where: { id },
        data: {
          value: link.url ?? undefined,
          name: link.text ?? undefined,
        },
      });
    },
  }),
);
