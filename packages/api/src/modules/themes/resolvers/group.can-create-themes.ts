import { builder } from '#lib';
import { GroupType } from '#modules/groups';
import { canCreateThemes } from '#modules/themes/utils';

builder.prismaObjectField(GroupType, 'canCreateThemes', (t) =>
  t.boolean({
    description: "Si l'utilisateur·ice connecté·e peut créer des thèmes au nom de ce groupe",
    resolve(group, _, { user }) {
      return canCreateThemes(user, group);
    },
  }),
);
