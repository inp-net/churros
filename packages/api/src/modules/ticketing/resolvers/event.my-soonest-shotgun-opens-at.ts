import { builder, prisma, soonest } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { userCanSeeTicket } from '#permissions';
import { EventType } from '#modules/events';

builder.prismaObjectField(EventType, 'mySoonestShotgunOpensAt', (t) =>
  t.field({
    type: DateTimeScalar,
    nullable: true,
    async resolve({ id }, _, { user }) {
      if (!user) return;
      const tickets = await prisma.ticket.findMany({
        where: { event: { id } },
        include: {
          openToGroups: true,
          openToSchools: true,
          openToMajors: true,
          event: {
            include: {
              managers: { include: { user: true } },
              bannedUsers: true,
              group: {
                include: {
                  studentAssociation: true,
                },
              },
            },
          },
        },
      });

      const userWithContributions = await prisma.user.findUniqueOrThrow({
        where: { id: user?.id },
        include: {
          groups: {
            include: { group: true },
          },
          major: {
            include: {
              schools: true,
            },
          },
          contributions: {
            include: {
              option: {
                include: {
                  offeredIn: true,
                  paysFor: {
                    include: {
                      school: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const accessibleTickets = tickets.filter((t) => userCanSeeTicket(t, userWithContributions));
      return soonest(...accessibleTickets.map((t) => t.opensAt));
    },
  }),
);
