import { FamilyTree, builder } from '#lib'
import {} from '#modules/global'
import { UserType } from '../index.js'

builder.objectType(FamilyTree, {
  name: 'FamilyTree',
  fields: (t) => ({
    nesting: t.exposeString('nesting'),
    users: t.expose('users', { type: [UserType] }),
  }),
});
