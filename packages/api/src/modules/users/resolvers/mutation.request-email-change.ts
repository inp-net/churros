import { builder, prisma, sendMail } from '#lib';
import { GraphQLError } from 'graphql';

export async function requestEmailChange(email: string, userId: string): Promise<void> {
  const request = await prisma.emailChange.create({
    data: {
      user: { connect: { id: userId } },
      email,
    },
  });

  const url = new URL(
    `/validate-email/${request.id.split(':', 2)[1]!.toUpperCase()}`,
    process.env.FRONTEND_ORIGIN,
  );

  await sendMail('verify-mail', email, { url: url.toString() }, {});
}

builder.mutationField('requestEmailChange', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      email: t.arg.string(),
    },
    authScopes: { loggedIn: true },
    async resolve(_, { email }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      await requestEmailChange(email, user.id);
      return true;
    },
  }),
);
