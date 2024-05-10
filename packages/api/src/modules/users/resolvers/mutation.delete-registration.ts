import { builder, objectValuesFlat, prisma } from '#lib';
import { userIsAdminOf } from '../../../permissions/index.js';

builder.mutationField('deleteRegistration', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      const studentAssociationId = objectValuesFlat(
        await prisma.registration.findMany({
          where: { id },
          select: {
            ticket: {
              select: {
                event: {
                  select: {
                    group: {
                      select: {
                        studentAssociationId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      );
      return Boolean(userIsAdminOf(user, studentAssociationId));
    },
    async resolve(_, { id }, { user }) {
      // const registration = await prisma.registration.findFirstOrThrow({
      //   where: { id },
      //   include: {
      //     ticket: { include: { event: { include: { beneficiary: true } } } },
      //     author: true,
      //   },
      // });
      // const beneficiaryUser = await prisma.user.findUnique({
      //   where: {uid: registration.beneficiary || registration.author.uid}
      // })
      // if (
      //   registration.paid &&
      //   registration.ticket.event.beneficiary &&
      //   registration.ticket.price > 0 &&
      //   registration.paymentMethod &&
      //   beneficiaryUser
      // ) {
      //   await pay(
      //     registration.ticket.event.beneficiary.uid,
      //     registration.author.uid,
      //     registration.ticket.price,
      //     registration.paymentMethod,
      //     beneficiaryUser.phone
      //   );
      // }

      await prisma.registration.deleteMany({
        where: { id },
      });
      await prisma.logEntry.create({
        data: {
          area: 'registration',
          action: 'delete',
          target: id,
          message: `Registration deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);
