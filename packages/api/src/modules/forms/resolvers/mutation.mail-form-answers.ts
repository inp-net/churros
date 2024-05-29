import { builder, formatDateTime, prisma, sendMail, splitID } from '#lib';
import { GraphQLError } from 'graphql';
import { answerToString } from '../utils/answers.js';

builder.mutationField('mailFormAnswers', (t) =>
  t.string({
    description:
      "Envoie une copie des réponses de l'utilisateur·ice connecté·e à ce formulaire par email. Renvoie l'adresse mail à laquelle les réponses ont été envoyées.",
    errors: {},
    authScopes: { loggedIn: true },
    args: { formId: t.arg.id({ description: 'ID du formulaire' }) },
    async resolve(_, { formId }, { user }) {
      if (!user)
        throw new GraphQLError('Vous devez être connecté·e pour envoyer vos réponses par email.');

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

      await sendMail(
        'form-answers',
        user.email,
        {
          answers: answers.map((a) => ({
            answerString: answerToString(a, user),
            questionTitle: a.question.title,
          })),
          answersDate: formatDateTime(new Date()),
          title: form.title,
          formId: form.id,
          linkToAnswers: new URL(
            `/forms/${splitID(form.id)[1]}/answer`,
            process.env.FRONTEND_ORIGIN,
          ).toString(),
        },
        {},
      );

      return user.email;
    },
  }),
);
