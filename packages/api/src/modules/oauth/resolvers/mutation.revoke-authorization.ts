import { builder, prisma } from '#lib';

builder.mutationField('revokeAuthorization', (t) =>
  t.boolean({
    description:
      "Révoque l'accès d'une application au compte utilisateur connecté. Renvoie `true` si l'opération a réussi.",
    args: {
      clientId: t.arg.string({ required: true, description: "Identifiant de l'application" }),
    },
    authScopes: { loggedIn: true },
    async resolve(_, { clientId }, { user }) {
      if (!user) return false;
      await prisma.thirdPartyCredential.deleteMany({
        where: {
          ownerId: user.id,
          clientId,
          type: {
            in: ['AccessToken', 'AuthorizationCode'],
          },
        },
      });
      return true;
    },
  }),
);
