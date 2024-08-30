import { builder, log, prisma, UnauthorizedError } from '#lib';
import { canCreateEvents } from '#modules/events/utils';
import { DateRangeInput, ShortString, UIDScalar } from '#modules/global';
import { Visibility } from '@churros/db/prisma';
import slug from 'slug';
import { ZodError } from 'zod';
import { EventType } from '../types/event.js';

builder.mutationField('createEvent', (t) =>
  t.prismaField({
    description: 'Créer un nouvel évènement',
    type: EventType,
    errors: { types: [Error, ZodError] },
    args: {
      group: t.arg({ type: UIDScalar, description: 'Groupe organisateur principal' }),
      title: t.arg({ type: ShortString }),
      dates: t.arg({
        type: DateRangeInput,
        description:
          "Dates de l'évènement. Si non précisé, l'évènement est créé sans dates, ce qui l'empêche d'avoir une visibilité autre que `Private` ou `Unlisted`.",
        required: false,
      }),
    },
    async authScopes(_, { group: groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
      });
      return canCreateEvents(user, group);
    },
    async resolve(query, _, { group: groupUid, title, dates }, { user }) {
      if (!user) throw new UnauthorizedError();
      await log('events', 'create', { group: groupUid, title, dates }, groupUid, user);
      const group = await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } });
      return prisma.event.create({
        ...query,
        data: {
          title,
          startsAt: dates?.start,
          endsAt: dates?.end,
          description: '',
          slug: slug(title),
          visibility: Visibility.Private,
          contactMail: group.email,
          author: { connect: { id: user.id } },
          group: { connect: { id: group.id } },
          managers: {
            create: {
              userId: user.id,
              canEdit: true,
              canEditPermissions: true,
              canVerifyRegistrations: true,
            },
          },
        },
      });
    },
  }),
);
