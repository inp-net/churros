import { builder, prisma } from '#lib';
import { DateTimeScalar, PicturedInterface } from '#modules/global';
import { UserType } from '#modules/users';
import { NotificationChannel } from '../index.js';

export const SentNotificationType = builder.prismaNode('SentNotification', {
  id: { field: 'id' },
  interfaces: [PicturedInterface],
  include: {
    subscription: true,
  },
  fields: (t) => ({
    sentAt: t.expose('sentAt', { type: DateTimeScalar }),
    subscriptionId: t.exposeID('subscriptionId', {
      description: "ID de l'abonnement associé à la notification",
    }),
    subscription: t.relation('subscription', {
      description: 'Abonnement associé à la notification',
    }),
    recipient: t.prismaField({
      type: UserType,
      description: 'Utilisateur destinataire de la notification',
      // https://pothos-graphql.dev/docs/plugins/prisma#indirect-relations-eg-join-tables
      // should work, but subscription.owner is not available on subscription's type in resolve
      // resolve: (_, { subscription }) => subscription.owner,
      // select(_args, _ctx, nestedSelection) {
      //   return {
      //     subscription: {
      //       select: {
      //         owner: nestedSelection(true),
      //       },
      //     },
      //   };
      // },
      // So we do this instead...
      async resolve(query, { subscriptionId }) {
        return prisma.notificationSubscription
          .findUniqueOrThrow({ where: { id: subscriptionId } })
          .owner(query);
      },
    }),
    title: t.exposeString('title', { description: 'Titre de la notification' }),
    body: t.exposeString('body', { description: 'Corps de la notification' }),
    goto: t.exposeString('goto', {
      description: `Lien vers lequel rediriger l'utilisateur en cas de clic sur la notification. Peut ne pas commencer par \`https://\` pour rediriger au sein de ${process.env.FRONTEND_ORIGIN}`,
    }),
    pictureFile: t.exposeString('pictureFile', {
      description: 'Fichier image associé à la notification programmée',
    }),
    actions: t.relation('actions', {
      description:
        "Actions à afficher en tant que boutons sur la notification. Fonctionne comme goto (la valeur du lien correspond à l'action à effectuer)",
    }),
    channel: t.expose('channel', {
      type: NotificationChannel,
      description: 'Canal de notification sur lequel envoyer la notification',
    }),
  }),
});
