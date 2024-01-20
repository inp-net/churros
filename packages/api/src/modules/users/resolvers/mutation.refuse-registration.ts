import { builder, prisma } from '#lib';

import { createTransport } from 'nodemailer';

// TODO rename registration to reject-user-candidate

builder.mutationField('refuseRegistration', (t) =>
  t.field({
    authScopes: { canEditUsers: true },
    type: 'Boolean',
    args: { email: t.arg.string(), reason: t.arg.string() },
    async resolve(_, { email, reason }, { user }) {
      const mailer = createTransport(process.env.SMTP_URL);
      await mailer.sendMail({
        to: email,
        from: process.env.PUBLIC_SUPPORT_EMAIL,
        subject: 'Inscription refusée',
        text: `Votre inscription a été refusée pour la raison suivante:\n\n ${reason}\n\n Si vous pensez qu'il s'agit d'une erreur, répondez à ce mail.`,
        html: `<p>Votre inscription a été refusée pour la raison suivante:<br><br> ${reason}<br><br> Si vous pensez qu'il s'agit d'une erreur, répondez à ce mail</p>`,
      });
      const candidate = await prisma.userCandidate.delete({ where: { email } });
      await prisma.logEntry.create({
        data: {
          action: 'refuse',
          area: 'signups',
          message: `Refus de l'inscription de ${email} pour ${reason}`,
          user: { connect: { id: user!.id } },
          target: `token ${candidate.token}`,
        },
      });
      return true;
    },
  }),
);
