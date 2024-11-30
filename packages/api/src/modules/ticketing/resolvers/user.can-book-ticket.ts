import { builder, ensureGlobalId, getSessionUser, graphinx, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { canBookTicket } from '#modules/ticketing';
import { UserType } from '#modules/users';

builder.prismaObjectField(UserType, 'canBookTicket', (t) =>
  t.field({
    type: builder.objectType(CanBookExplanation, {
      name: 'CanBookExplanation',
      ...graphinx('ticketing'),
      fields: (t) => ({
        can: t.exposeBoolean('can'),
        why: t.exposeString('why', {
          description: "Explication de pourquoi l'on ne peut pas réserver",
        }),
      }),
    }),
    description: "L'utilisateur·ice peut réserver un billet pour un évènement donné",
    args: {
      id: t.arg({
        type: LocalID,
        description: 'Le billet à vérifier',
      }),
    },
    async resolve({ id: userId }, { id }) {
      id = ensureGlobalId(id, 'Ticket');
      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: {
          id,
        },
        include: canBookTicket.prismaIncludes,
      });
      const userAdditionalData = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        include: canBookTicket.userPrismaIncludes,
      });
      const sessionUser = await getSessionUser(userAdditionalData.uid);
      const [can, why] = canBookTicket(sessionUser, userAdditionalData, null, ticket);
      return new CanBookExplanation(can, why);
    },
  }),
);

class CanBookExplanation {
  can: boolean;
  why: string;

  constructor(can: boolean, why: string) {
    this.can = can;
    this.why = why;
  }
}
