import { builder, prisma } from '#lib';
import { StringToIntMappingType } from '#modules/global';
import { QuestionSelectOneType } from '../types/question-select-one.js';
import { canSeeAnswerStatsForQuestion } from '../utils/permissions.js';

builder.prismaObjectField(QuestionSelectOneType, 'answerCounts', (t) =>
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
    resolve: async ({ id, options }, _) =>
      Promise.all(
        options.map(async (option) => ({
          key: option,
          value: await prisma.answer.count({
            where: {
              questionId: id,
              answer: { equals: [option] },
            },
          }),
        })),
      ),
  }),
);
