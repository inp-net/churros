// TODO rename to memberships
import { builder } from '#lib';
import { UserType } from '#modules/users';
import { prismaOrderUserMemberships } from '../utils/sort.js';

builder.prismaObjectField(UserType, 'groups', (t) =>
  t.relation('groups', {
    query: {
      orderBy: prismaOrderUserMemberships,
    },
  }),
);
