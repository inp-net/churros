import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { log } from '../../../lib/logger.js';
import {} from '../index.js';
// TODO rename deactivate-third-party-app

builder.mutationField('deactivateApp', (t) =>
  t.boolean({
    description: 'Deactivate a third-party app. Only admins can do this.',
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
    },
    authScopes: { admin: true },
    async resolve(_, { id }, { user }) {
      await prisma.thirdPartyApp.update({
        where: { id },
        data: { active: false },
      });
      await log('third-party apps', 'deactivate', {}, id, user);
      return true;
    },
  }),
);
