import { builder, inDevelopment, isThirdPartyToken, prisma } from '#lib';
import {
  NotificationChannel as NotificationChannelPrisma,
  ThirdPartyCredentialType,
} from '@prisma/client';
import { notify, type PushNotification } from '../index.js';

builder.mutationField('sendNotification', (t) =>
  t.boolean({
    directives: inDevelopment() ? { rateLimit: { duration: 3600, limit: 1 } } : {},
    description:
      "Envoie une notification à l'utilisateur connecté. Limité à une notification par heure. Si l'utilisateur a désactivé les notifications de type “Autres” pour le groupe responsable du [client OAuth](/oauth) faisant la requête, la notification ne lui sera pas envoyée.",
    args: {
      title: t.arg.string({
        description:
          "Titre de la notification. Sera préfixé par “[Nom de l'application]” quand la mutation est appelée par un [client OAuth](/oauth).",
      }),
      body: t.arg.string({ description: 'Corps de la notification.' }),
    },
    authScopes: { loggedIn: true },
    async resolve(_, { title, body }, { user, token }) {
      if (!user || !token) return false;

      const data: PushNotification['data'] = {
        channel: NotificationChannelPrisma.Other,
        goto: '/',
        group: undefined,
      };

      if (isThirdPartyToken(token)) {
        const thirdPartyApp = await prisma.thirdPartyApp.findFirstOrThrow({
          where: {
            credentials: {
              some: {
                value: token,
                type: ThirdPartyCredentialType.AccessToken,
              },
            },
          },
          include: {
            owner: true,
          },
        });

        title = `[${thirdPartyApp.name}] ${title}`;
        const _goto = new URL(thirdPartyApp.website);
        _goto.searchParams.set('from', 'churros-notification');
        data.goto = _goto.toString();
        data.group = thirdPartyApp.owner.uid;
      }
      await notify([user], {
        title,
        body,
        data,
      });
      return true;
    },
  }),
);
