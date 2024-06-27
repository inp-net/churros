import { builder } from '#lib';
import { GroupType } from '#modules/groups';
import { PageType } from '#modules/pages/types';
import { PagesConnectionType } from '../types/pages-connection.js';
import { canListGroupPages } from '../utils/permissions.js';

builder.prismaObjectFields(GroupType, (t) => ({
  canListPages: t.field({
    type: 'Boolean',
    description: "L'utilisateur·ice connecté·e peut lister les pages du groupe",
    resolve: (group, _, { user }) => canListGroupPages(user, group),
  }),
  pages: t.relatedConnection(
    'pages',
    {
      type: PageType,
      cursor: 'id',
      description: 'Les pages associées au groupe',
      authScopes: async (group, _, { user }) => canListGroupPages(user, group),
    },
    PagesConnectionType,
  ),
}));
