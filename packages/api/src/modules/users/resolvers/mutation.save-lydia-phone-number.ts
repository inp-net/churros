import { builder, prisma, UnauthorizedError } from '#lib';
import { UserType } from '#modules/users/types';

builder.mutationField('saveLydiaPhoneNumber', (t) =>
  t.prismaField({
    type: UserType,
    description: "Sauvegarder le numéro de téléphone pour les paiements Lydia de l'utilisateur.ice",
    args: {
      phoneNumber: t.arg.string(),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { phoneNumber }, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.user.update({
        ...query,
        where: { id: user.id },
        data: { lydiaPhone: phoneNumber },
      });
    },
  }),
);
