import { builder } from '../builder.js';

builder.prismaObject('School', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
  }),
});
