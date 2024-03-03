import { builder } from '#lib';
import { GroupType } from '#modules/groups';
import { canCreateEvents } from '../index.js';

builder.objectField(GroupType, 'canCreateEvents', (t) =>
  t.boolean({
    description: 'Vrai si la personne connectée peut créer des événements dans ce groupe.',
    resolve: (group, _, { user }) => canCreateEvents(user, group),
  }),
);
