import { builder } from '#lib';
import { PageType } from '#modules/pages/types';
import { StudentAssociationType } from '#modules/student-associations';
import { PagesConnectionType } from '../types/pages-connection.js';
import { canListStudentAssociationPages } from '../utils/permissions.js';

builder.prismaObjectFields(StudentAssociationType, (t) => ({
  canListPages: t.field({
    type: 'Boolean',
    description: "L'utilisateur·ice connecté·e peut lister les pages de l'AE",
    resolve: ({ id }, _, { user }) => canListStudentAssociationPages(user, id),
  }),
  pages: t.relatedConnection(
    'pages',
    {
      type: PageType,
      cursor: 'id',
      description: "Les pages associées à l'AE",
      authScopes: async ({ id }, _, { user }) => canListStudentAssociationPages(user, id),
    },
    PagesConnectionType,
  ),
}));
