import { builder } from '#lib';
import { PicturedInterface } from '#modules/global';
import { NotificationChannel } from '../index.js';

builder.prismaNode('ScheduledNotification', {
  id: { field: 'id' },
  interfaces: [PicturedInterface],
  description: 'Notification programmée pour envoi à une date donnée',
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      description: 'Date de programmation de la notification',
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      description: 'Date de dernière modification de la notification programmée',
    }),
    scheduledTo: t.expose('scheduledTo', {
      type: 'DateTime',
      description: 'Date à laquelle la notification doit être envoyée',
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
    group: t.relation('group', {
      description: 'Groupe auquel la notification est associée',
    }),
    groupId: t.exposeID('groupId', {
      description: 'ID du groupe auquel la notification est associée',
      nullable: true,
    }),
    vibrate: t.expose('vibrate', {
      type: ['Int'],
      description:
        'Modèle de vibration du téléphone en millisecondes: [durée, pause, durée, pause, ...]',
    }),
  }),
});
