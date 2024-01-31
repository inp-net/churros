import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { eventAccessibleByUser, userCanSeeTicket } from '#permissions';
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
      return eventAccessibleByUser(event, user);
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
      const userWithContributesTo = user
        ? await prisma.user.findUniqueOrThrow({
            where: { id: user.id },
            include: {
              contributions: {
                include: {
                  option: {
                    include: {
                      paysFor: {
                        include: {
                          school: true,
                        },
                      },
                    },
                  },
                },
              },
              groups: {
                include: {
                  group: true,
                },
              },
              managedEvents: {
                include: {
                  event: true,
                },
              },
              major: {
                include: {
                  schools: true,
                },
              },
            },
          })
        : undefined;

      return allTickets.filter((ticket) => userCanSeeTicket(ticket, userWithContributesTo));
    },
  }),
);
