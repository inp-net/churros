import { TicketInput, TicketType } from '../index.js';
import {} from '#modules/global';
import { builder, log, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { eventManagedByUser } from '#permissions';
import { createTicketUid as createUid } from '../index.js';

builder.mutationField('upsertTicket', (t) =>
  t.prismaField({
    type: TicketType,
    description: 'Créer ou modifier un billet',
    args: {
      eventId: t.arg.id({
        description: "L'identifiant de l'évènement sur lequel créer ou modifier un billet",
      }),
      id: t.arg.id({
        required: false,
        description:
          "Laisser vide pour créer un billet, donner l'id du billet à modifier pour le modifier",
      }),
      ticket: t.arg({ type: TicketInput }),
    },
    async authScopes(_, { eventId }, { user }) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { managers: { include: { user: true } } },
      });
      if (!event) return false;
      return eventManagedByUser(event, user, { canEdit: true });
    },
    async resolve(query, _, { eventId, id, ticket }, { user }) {
      if (!user) throw new GraphQLError('Non connecté');

      const connectOnUids = (uids: Array<string>) => ({
        connect: uids.map((uid) => ({ uid })),
      });

      await log('events', `${id ? 'update' : 'create'}-ticket`, { ticket }, id, user);
      return prisma.ticket.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          ...ticket,
          eventId,
          uid: await createUid({ name: ticket.name, eventId }),
          links: { createMany: { data: ticket.links, skipDuplicates: true } },
          openToSchools: connectOnUids(ticket.openToSchools),
          openToGroups: connectOnUids(ticket.openToGroups),
          openToMajors: connectOnUids(ticket.openToMajors),
          autojoinGroups: connectOnUids(ticket.autojoinGroups),
        },
        update: {
          ...ticket,
          links: { deleteMany: {}, createMany: { data: ticket.links, skipDuplicates: true } },
          openToSchools: connectOnUids(ticket.openToSchools),
          openToGroups: connectOnUids(ticket.openToGroups),
          openToMajors: connectOnUids(ticket.openToMajors),
          autojoinGroups: connectOnUids(ticket.autojoinGroups),
        },
      });
    },
  }),
);
