import { builder, prisma, publish } from '#lib';

// TODO rename to cancel-booking.ts

builder.mutationField('cancelRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      const registration = await prisma.registration.findFirst({
        where: { id },
        include: {
          author: true,
          ticket: {
            include: {
              event: {
                include: {
                  managers: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!registration) return false;
      if (!user.admin && user.uid !== registration.author?.uid) return false;
      return true;
    },
    async resolve(_, { id }, { user }) {
      const {
        ticket: { eventId },
      } = await prisma.registration.update({
        where: { id },
        data: {
          cancelledAt: new Date(),
          cancelledBy: { connect: { id: user?.id } },
        },
        include: { ticket: true },
      });
      publish(eventId, 'deleted', id);
      return true;
    },
  }),
);
