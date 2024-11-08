import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventManagerInviteType } from '#modules/events/types';
import { canEditManagers, canEditManagersPrismaIncludes } from '#modules/events/utils';
import { LocalID } from '#modules/global';

builder.mutationField('deleteEventManagerInvite', (t) =>
  t.prismaField({
    type: EventManagerInviteType,
    errors: {},
    description: "Supprimer une invitation de managers d'évènement",
    args: {
      id: t.arg({ type: LocalID }),
      kickManagers: t.arg.boolean({
        defaultValue: false,
        description: 'Aussi enlever des managers celleux qui le sont devenu via cette invation',
      }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.eventManagerInvite
        .findUniqueOrThrow({
          where: { id: ensureGlobalId(id, 'EventManagerInvite') },
        })
        .event({ include: canEditManagersPrismaIncludes });
      return canEditManagers(event, user);
    },
    async resolve(query, _, { id, kickManagers }, { user }) {
      id = ensureGlobalId(id, 'EventManagerInvite');
      const invite = await prisma.eventManagerInvite.findUniqueOrThrow({
        where: { id },
        include: { usedBy: true },
      });

      await log('events', 'managers-invite/delete', { id, invite, kickManagers }, id, user);

      const [kicked, result] = await prisma.$transaction([
        prisma.eventManager.deleteMany({
          where: {
            eventId: invite.eventId,
            userId: { in: kickManagers ? invite.usedBy.map((u) => u.id) : [] },
          },
        }),
        prisma.eventManagerInvite.delete({
          ...query,
          where: { id },
        }),
      ]);

      if (kickManagers)
        await log('vents', 'managers-invite/kick-by-delete', { id, invite, kicked }, id, user);

      return result;
    },
  }),
);
