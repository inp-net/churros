import { builder, log, prisma, purgeSessionsUser, UnauthorizedError } from '#lib';
import { EventManagerType } from '#modules/events/types';
import {
  eventManagerInviteHasNoUsesLeft,
  isEventManagerInviteExpired,
} from '#modules/events/utils';
import { GraphQLError } from 'graphql';

builder.mutationField('useEventManagerInvite', (t) =>
  t.prismaField({
    type: EventManagerType,
    errors: {},
    description: "Utilise une invitation de manager d'évènement. Renvoie l'objet manager créé",
    args: {
      code: t.arg.string({
        description: "Code d'invitation",
      }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { code }, { user }) {
      if (!user) throw new UnauthorizedError();

      const invite = await prisma.eventManagerInvite.update({
        where: { code },
        data: {
          usedBy: {
            connect: { id: user.id },
          },
        },
        include: { event: true },
      });

      if (isEventManagerInviteExpired(invite)) 
        throw new GraphQLError('Cette invitation a expiré');
      

      if (await eventManagerInviteHasNoUsesLeft(invite)) 
        throw new GraphQLError("Cette invitation n'a plus de place");
      

      await log('events', 'join-managers-via-invite', invite, invite.eventId, user);

      await purgeSessionsUser(user.uid);

      return prisma.eventManager.upsert({
        ...query,
        where: {
          eventId_userId: {
            eventId: invite.eventId,
            userId: user.id,
          },
        },
        update: {},
        create: {
          eventId: invite.eventId,
          userId: user.id,
          canEdit: invite.canEdit,
          canEditPermissions: invite.canEditPermissions,
          canVerifyRegistrations: invite.canVerifyRegistrations,
        },
      });
    },
  }),
);
