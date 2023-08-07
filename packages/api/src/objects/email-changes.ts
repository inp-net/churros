import { createTransport } from 'nodemailer';
import { prisma } from '../prisma.js';
import { ID_PREFIXES_TO_TYPENAMES, builder } from '../builder.js';
import { GraphQLError } from 'graphql';
import { DateTimeScalar } from './scalars.js';
import { purgeUserSessions } from '../context.js';

const TYPENAMES_TO_ID_PREFIX = Object.fromEntries(
  Object.entries(ID_PREFIXES_TO_TYPENAMES).map(([k, v]) => [v, k])
) as Record<string, keyof typeof ID_PREFIXES_TO_TYPENAMES>;

export const EmailChangeType = builder.prismaObject('EmailChange', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    email: t.exposeString('email'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    pending: t.exposeBoolean('pending'),
    user: t.relation('user'),
  }),
});

const transporter = createTransport(process.env.SMTP_URL);
export async function requestEmailChange(email: string, userId: string): Promise<void> {
  const request = await prisma.emailChange.create({
    data: {
      user: { connect: { id: userId } },
      email,
    },
  });

  const url = new URL(
    `/validate-email/${request.id.split(':', 2)[1]!.toUpperCase()}`,
    process.env.FRONTEND_ORIGIN
  );

  console.log(`Sending email validation mail to ${email}, validation URL is ${url.toString()}`);
  await transporter.sendMail({
    to: email,
    subject: `Validation de votre adresse e-mail`,
    html: `
        <p><a href="${url.toString()}">Validez votre adresse e-mail</a></p>
        `,
    text: `Validez votre adresse e-mail sur ${url.toString()}`,
  });
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
  })
);

builder.mutationField('validateEmail', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      token: t.arg.string(),
    },
    async resolve(_, { token }) {
      const id = `${TYPENAMES_TO_ID_PREFIX['EmailChange']!}:${token.toLowerCase()}`;
      console.log(`Searching email change with id ${id}`);
      // prisma errors out if the email validation is not found
      const { email, user, pending } = await prisma.emailChange.findUniqueOrThrow({
        where: { id },
        include: { user: true },
      });

      if (!pending)
        throw new GraphQLError("Cette demande de changement d'adresse e-mail a déjà été utilisée.");

      if (await prisma.user.findUnique({ where: { email } }))
        throw new GraphQLError('Un autre utilisateur a déjà cette adresse e-mail');

      await prisma.user.update({
        where: { id: user.id },
        data: { email },
      });
      purgeUserSessions(user.uid);
      await prisma.emailChange.update({
        where: { id },
        data: { pending: false },
      });
      return true;
    },
  })
);
