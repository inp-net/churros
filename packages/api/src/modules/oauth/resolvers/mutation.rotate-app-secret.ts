import { builder, prisma } from '#lib';

import { userCanEditApp } from '#permissions';
import { hash } from 'argon2';
import { nanoid } from 'nanoid';
import { log } from '../../../lib/logger.js';
import { CLIENT_SECRET_LENGTH } from '../index.js';
// TODO rename rotate-app-client-secret

builder.mutationField('rotateAppSecret', (t) =>
  t.string({
    description: "Rotate a third-party app's secret",
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
    },
    authScopes: userCanEditApp,
    async resolve(_, { id }, { user }) {
      const secretClear = nanoid(CLIENT_SECRET_LENGTH);
      await prisma.thirdPartyApp.update({
        where: { id },
        data: { secret: await hash(secretClear) },
      });
      await log('third-party apps', 'rotate secret', {}, id, user);
      return secretClear;
    },
  }),
);
