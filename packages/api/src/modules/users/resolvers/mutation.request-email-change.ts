import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { createTransport } from 'nodemailer';

export async function requestEmailChange(email: string, userId: string): Promise<void> {
  const transporter = createTransport(process.env.SMTP_URL);
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

  await transporter.sendMail({
    from: process.env.PUBLIC_CONTACT_EMAIL,
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
  }),
);
