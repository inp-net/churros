import { builder } from '#lib';
import { GroupType } from '#modules/groups';
import { canCreateArticles } from '../utils/permissions.js';

builder.objectField(GroupType, 'canCreateArticles', (t) =>
  t.boolean({
    description: 'Vrai si la personne connectée peut créer des posts dans ce groupe.',
    resolve: (group, _, { user }) => {
      return canCreateArticles(user, group);
    },
  }),
);
