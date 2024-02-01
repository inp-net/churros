import { builder, log, prisma } from '#lib';

// TODO rename activate-third-party-app

builder.mutationField('activateApp', (t) =>
  t.boolean({
    description: 'Activate a third-party app. Only admins can do this.',
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
    },
    authScopes: { admin: true },
    async resolve(_, { id }, { user }) {
      await prisma.thirdPartyApp.update({
        where: { id },
        data: { active: true },
      });
      await log('third-party apps', 'activate', {}, id, user);
      return true;
    },
  }),
);
