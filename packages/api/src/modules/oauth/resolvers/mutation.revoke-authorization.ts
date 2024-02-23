import { builder, isThirdPartyToken, makeGlobalID, prisma } from '#lib';

builder.mutationField('revokeAuthorization', (t) =>
  t.boolean({
    description:
      "Révoque l'accès d'une application au compte utilisateur connecté. Renvoie `true` si l'opération a réussi.",
    args: {
      clientId: t.arg.string({ required: true, description: "Identifiant de l'application" }),
    },
    async authScopes(_, { clientId }, { token, user }) {
      if (!token || !user) return false;
      if (isThirdPartyToken(token)) {
        // Third party apps can only revoke their own authorizations
        const thirdPartyCredential = await prisma.thirdPartyCredential.findFirst({
          where: {
            ownerId: user.id,
            clientId,
            type: {
              in: ['AccessToken', 'AuthorizationCode'],
            },
          },
        });
        return clientId === thirdPartyCredential?.clientId;
      }

      return true;
    },
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
      await prisma.user.update({
        where: { id: user.id },
        data: {
          allowedApps: {
            disconnect: {
              id: makeGlobalID('ThirdPartyApp', clientId),
            },
          },
        },
      });
      return true;
    },
  }),
);
