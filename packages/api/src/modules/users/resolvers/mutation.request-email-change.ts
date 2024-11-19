import { builder, log, prisma, sendMail } from '#lib';
import { Email, UIDScalar, URLScalar } from '#modules/global';
import { EmailChangeType } from '#modules/users/types';
import type { Prisma } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';

builder.mutationField('requestEmailChange', (t) =>
  t.prismaField({
    type: EmailChangeType,
    errors: {},
    args: {
      newEmail: t.arg({ type: Email, description: 'Nouvelle addresse e-mail' }),
      user: t.arg({ type: UIDScalar, description: "Personne à qui changer l'adresse email" }),
      callbackURL: t.arg({
        type: URLScalar,
        description:
          "URL vers laquelle faire pointer le lien de validation de la nouvelle adresse email. [token] sera remplacé par le token d'activation.",
      }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { newEmail, callbackURL, user: targetUser }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      const subject = await prisma.user.findUniqueOrThrow({
        where: { uid: targetUser },
      });
      await log('users', 'request-email-change', { newEmail, user, callbackURL }, user.id, user);
      return requestEmailChange(query, newEmail, subject.id, callbackURL);
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
