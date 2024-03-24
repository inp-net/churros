import { builder, prisma } from '#lib';
import { StringToIntMappingType } from '#modules/global';
import { GraphQLError } from 'graphql';
import range from 'lodash.range';
import { QuestionScaleType } from '../types/question-scale.js';
import { canSeeAllAnswers } from '../utils/permissions.js';

builder.prismaObjectField(QuestionScaleType, 'answerCounts', (t) =>
  t.field({
    type: [StringToIntMappingType],
    description:
      "Compte le nombre total de réponses pour chaque option. Retourne un `StringToIntMapping` où les clés sont les options et les valeurs sont le nombre de réponses pour l'option.",
    authScopes: (question, _, { user }) =>
      canSeeAllAnswers(question.section.form, question.section.form.event, user),
    resolve: async ({ id, scaleStart, scaleEnd }, _) => {
      if (!scaleStart || !scaleEnd) throw new GraphQLError('Missing scaleStart or scaleEnd');
      const normalize = (value: number) => (scaleStart + value) / (scaleEnd - scaleStart);
      return Promise.all(
        range(scaleStart, scaleEnd + 1).map(async (option) => ({
          key: `${option}/${scaleEnd}`,
          value: await prisma.answer.count({
            where: {
              questionId: id,
              number: {
                lte: normalize(option + 1),
                gte: normalize(option),
              },
            },
          }),
        })),
      );
    },
  }),
);
