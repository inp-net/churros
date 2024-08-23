import { builder, log, prisma, sendMail } from '#lib';
import { Email, URLScalar } from '#modules/global';
import { EmailChangeType } from '#modules/users/types';
import type { Prisma } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';

builder.mutationField('requestEmailChange', (t) =>
  t.prismaField({
    type: EmailChangeType,
    errors: {},
    args: {
      email: t.arg({ type: Email }),
      callbackURL: t.arg({
        type: URLScalar,
        description:
          "URL vers laquelle faire pointer le lien de validation de la nouvelle adresse email. [token] sera remplacé par le token d'activation.",
      }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { email, callbackURL }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      await log('users', 'request-email-change', { email, callbackURL }, user.id, user);
      return requestEmailChange(query, email, user.id, callbackURL);
    },
  }),
);

export async function requestEmailChange<
  Query extends {
    include?: Prisma.EmailChangeInclude;
    select?: Prisma.EmailChangeSelect;
  },
>(
  query: Query,
  email: string,
  userId: string,
  callbackURLTemplate: URL,
): Promise<Prisma.EmailChangeGetPayload<Query>> {
  const request = await prisma.emailChange.create({
    ...query,
    data: {
      user: { connect: { id: userId } },
      email,
    },
  });

  const url = new URL(callbackURLTemplate.toString().replaceAll('[token]', request.token));

  await sendMail('verify-mail', email, { url: url.toString() }, {});

  return request as Prisma.EmailChangeGetPayload<Query>;
}
