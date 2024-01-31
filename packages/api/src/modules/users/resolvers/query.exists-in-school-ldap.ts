import { builder, findSchoolUser } from '#lib';

// TODO maybe create a LDAP module?

builder.queryField('existsInSchoolLdap', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      email: t.arg.string(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(_, { email }) {
      return Boolean(await findSchoolUser({ email }));
    },
  }),
);
