import { builder } from '#lib';
import { UserType } from './user.js';

type User = Omit<typeof UserType.$inferType, 'familyTree'>;

export class FamilyTree {
  nesting: string; // This is ugly. JSON-stringified list of (list of (...) | string) containig the nesting of user uids
  users: Array<User>;

  constructor(nesting: string, users: User[]) {
    this.nesting = nesting;
    this.users = users;
  }
}

builder.objectType(FamilyTree, {
  name: 'FamilyTree',
  fields: (t) => ({
    nesting: t.exposeString('nesting'),
    users: t.expose('users', { type: [UserType] }),
  }),
});
