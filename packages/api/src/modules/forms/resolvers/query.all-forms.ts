import { builder, prisma } from '#lib';
import { FormType } from '../types/form.js';

builder.queryField('allForms', (t) =>
  t.prismaConnection({
    description: 'Récupère tous les formulaires. Réservé aux admins.',
    cursor: 'id',
    type: FormType,
    authScopes: { admin: true },
    resolve: async (query) => prisma.form.findMany(query),
  }),
);
