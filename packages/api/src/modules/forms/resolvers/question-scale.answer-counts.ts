import { builder, prisma } from '#lib';
import { StringToIntMappingType } from '#modules/global';
import { GraphQLError } from 'graphql';
import countBy from 'lodash.countby';
import range from 'lodash.range';
import { QuestionScaleType } from '../types/question-scale.js';
import { answerToString } from '../utils/answers.js';
import { canSeeAnswerStatsForQuestion } from '../utils/permissions.js';

builder.prismaObjectField(QuestionScaleType, 'answerCounts', (t) =>
  t.field({
    type: [StringToIntMappingType],
    description:
      "Compte le nombre total de réponses pour chaque option. Retourne un `StringToIntMapping` où les clés sont les options et les valeurs sont le nombre de réponses pour l'option.",
    authScopes: (question, _, { user }) =>
      canSeeAnswerStatsForQuestion(
        question,
        // @ts-expect-error seems like TS does not pick up on the includes done by the requiredIncludesForPermissions constant, see QuestionType.
        question.section.form,
        // @ts-expect-error seems like TS does not pick up on the includes done by the requiredIncludesForPermissions constant, see QuestionType.
        question.section.form.event,
        user,
      ),
    resolve: async ({ id, scaleStart, scaleEnd }, _) => {
      if (scaleStart === null || scaleEnd === null)
        throw new GraphQLError('Missing scaleStart or scaleEnd');
      const display = (value: string[]) =>
        answerToString({
          answer: value,
          question: { scaleStart, scaleEnd, anonymous: false, type: 'Scale' },
          createdById: null,
        });
      const answers = await prisma.answer.findMany({ where: { questionId: id } });
      const counts = countBy(answers, ({ answer }) => display(answer));
      return Promise.all(
        range(scaleStart, scaleEnd + 1).map(async (option) => {
          const key = display([`${option - scaleStart}/${scaleEnd - scaleStart}`]);
          return { key, value: counts[key] ?? 0 };
        }),
      );
    },
  }),
);
