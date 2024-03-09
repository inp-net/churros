import { builder, prisma } from '#lib';
import { FormType } from '../index.js';

builder.queryField('forms', (t) =>
  t.prismaConnection({
    cursor: 'id',
    authScopes: { admin: true },
    type: FormType,
    resolve: async (query) => prisma.form.findMany({ ...query }),
  }),
);
