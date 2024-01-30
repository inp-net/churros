import { builder, prisma } from '#lib';

import { userCanManageEvent } from '#permissions';

// TODO rename to oppose-booking.ts

builder.mutationField('opposeRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      if (user.admin) return true;
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          ticket: {
            include: {
              event: {
                include: {
                  managers: { include: { user: true } },
                },
              },
            },
          },
        },
      });
      if (!registration) return false;
      if (!userCanManageEvent(registration.ticket.event, user, { canVerifyRegistrations: true }))
        return false;
      return true;
    },
    async resolve(_, { id }, { user }) {
      await prisma.registration.update({
        where: { id },
        data: {
          opposedAt: new Date(),
          opposedBy: { connect: { id: user?.id } },
        },
      });
      return true;
    },
  }),
);
