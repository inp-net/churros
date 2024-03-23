import { builder, formatDateTime, prisma, splitID } from '#lib';
import { GraphQLError } from 'graphql';
import { createTransport } from 'nodemailer';
import { answerToString } from '../utils/answers.js';

builder.mutationField('mailFormAnswers', (t) =>
  t.string({
    description:
      "Envoie une copie des réponses de l'utilisateur·ice connecté·e à ce formulaire par email. Renvoie l'adresse mail à laquelle les réponses ont été envoyées.",
    errors: {},
    authScopes: { loggedIn: true },
    args: { formId: t.arg.id({ description: 'ID du formulaire' }) },
    async resolve(_, { formId }, { user }) {
      if (!user) {
        throw new GraphQLError('Vous devez être connecté·e pour envoyer vos réponses par email.');
      }

      const form = await prisma.form.findUniqueOrThrow({
        where: { id: formId },
        select: { title: true, id: true },
      });
      const answers = await prisma.answer.findMany({
        where: {
          question: {
            section: {
              formId,
            },
          },
          createdById: user.id,
        },
        orderBy: [
          {
            question: { section: { order: 'asc' } },
          },
          {
            question: { order: 'asc' },
          },
        ],
        include: {
          question: true,
        },
      });

      const mailer = createTransport(process.env.SMTP_URL);
      await mailer.sendMail({
        to: user.email,
        from: process.env.PUBLIC_SUPPORT_EMAIL,
        subject: `Tes réponses à ${form.title}`,
        html: `
  <h1>Tes réponses à ${form.title}</h1>

  <p>Réponses du ${formatDateTime(new Date())}
  
  <ul>${answers
    .map(
      (a) => `
       <li><strong>${a.question.title}</strong>: ${answerToString(a, user)}</li>
  `,
    )
    .join('')}
  </ul>

  <a href="${new URL(`/forms/${splitID(form.id)[1]}/answer`, process.env.FRONTEND_ORIGIN)}">Modifier mes réponses</a>
  
  <pre>${form.id}</pre>
  `,
        text: `
  Tes réponses à ${form.title}

  Réponses du ${formatDateTime(new Date())}

  ${answers
    .map(
      (a) => `
       ${a.question.title}: ${answerToString(a, user)}
  `,
    )
    .join('')}

  Modifier mes réponses: ${new URL(`/forms/${splitID(form.id)[1]}/answer`, process.env.FRONTEND_ORIGIN)}

  ${form.id}
  `,
      });

      return user.email;
    },
  }),
);
