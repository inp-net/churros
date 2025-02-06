import { builder } from '#lib';
import { Event as NotellaEvent } from '@inp-net/notella';
import { queueNotification } from '../index.js';

builder.mutationField('sendNotification', (t) =>
  t.boolean({
    directives: { rateLimit: { duration: 3600, limit: 1 } },
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
    async resolve(_, { title, body }, { user }) {
      if (!user) return false;

      await queueNotification({
        title,
        body,
        event: NotellaEvent.Custom,
        action: '/',
        object_id: '',
      });
      return true;
    },
  }),
);
