import { builder, prisma } from '#lib';

import { getUserWithContributesTo, userCanAccessEvent, userCanSeeTicket } from '#permissions';
import { TicketType } from '../index.js';
// TODO rename to event.tickets

builder.queryField('ticketsOfEvent', (t) =>
  t.prismaField({
    type: [TicketType],
    args: {
      eventUid: t.arg.string(),
      groupUid: t.arg.string(),
    },
    async authScopes(_, { eventUid, groupUid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } });
      const event = await prisma.event.findUnique({
        where: { groupId_uid: { groupId: group.id, uid: eventUid } },
        include: {
          coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
          group: { include: { studentAssociation: { include: { school: true } } } },
          tickets: true,
          managers: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!event) return false;
      return userCanAccessEvent(event, user);
    },
    async resolve(query, _, { eventUid, groupUid }, { user }) {
      const allTickets = await prisma.ticket.findMany({
        where: { event: { uid: eventUid, group: { uid: groupUid } } },
        include: {
          ...query.include,
          openToGroups: {
            include: {
              studentAssociation: true,
            },
          },
          openToSchools: true,
          event: {
            include: {
              managers: true,
              bannedUsers: true,
              group: {
                include: {
                  studentAssociation: true,
                },
              },
            },
          },
          openToMajors: true,
          group: true,
        },
      });
      const userWithContributesTo = user ? await getUserWithContributesTo(user.id) : undefined;

      return allTickets.filter((ticket) => userCanSeeTicket(ticket, userWithContributesTo));
    },
  }),
);
