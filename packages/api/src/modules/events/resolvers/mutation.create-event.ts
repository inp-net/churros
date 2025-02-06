import { builder, log, prisma, UnauthorizedError } from '#lib';
import { EventManagerPowerLevelNames } from '#modules/events/types';
import { canCreateEvents, powerlevelToPermissions } from '#modules/events/utils';
import { DateRangeInput, ShortString, UIDScalar } from '#modules/global';
import { Visibility } from '@churros/db/prisma';
import { nanoid } from 'nanoid';
import slug from 'slug';
import { ZodError } from 'zod';
import {
  DEFAULT_EVENT_MANAGER_INVITE_CAPACITY,
  DEFAULT_EVENT_MANAGER_INVITE_POWERLEVEL,
} from '../types/event-manager-invite.js';
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
      createManagerInvite: t.arg.boolean({
        defaultValue: false,
        description: `Crée un lien d'invitation à ${DEFAULT_EVENT_MANAGER_INVITE_CAPACITY} utilisations pour inviter des managers à l'évènement avec niveau de permissions ${EventManagerPowerLevelNames[DEFAULT_EVENT_MANAGER_INVITE_POWERLEVEL]}`,
      }),
    },
    async authScopes(_, { group: groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        where: { uid: groupUid },
      });
      return canCreateEvents(user, group);
    },
    async resolve(query, _, { group: groupUid, title, dates, createManagerInvite }, { user }) {
      if (!user) throw new UnauthorizedError();
      await log(
        'events',
        'create',
        { group: groupUid, title, dates, createManagerInvite },
        groupUid,
        user,
      );
      const group = await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } });
      const defaultApplicableOffers = await prisma.promotion.findMany({
        where: {
          validByDefaultOn: {
            some: {
              id: group.id,
            },
          },
        },
      });
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
          applicableOffers: {
            connect: defaultApplicableOffers.map((offer) => ({ id: offer.id })),
          },
          managerInvites: createManagerInvite
            ? {
                create: {
                  code: nanoid(6),
                  capacity: DEFAULT_EVENT_MANAGER_INVITE_CAPACITY,
                  ...powerlevelToPermissions(DEFAULT_EVENT_MANAGER_INVITE_POWERLEVEL),
                },
              }
            : undefined,
        },
      });
    },
  }),
);
