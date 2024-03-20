import { builder, prisma, publish } from '#lib';
import { AnswerInput } from '../types/answer-input.js';
import { AnswerType } from '../types/answer.js';
import { castAnswer } from '../utils/answers.js';

builder.mutationField('answerQuestion', (t) =>
  t.prismaField({
    type: AnswerType,
    args: {
      input: t.arg({
        type: AnswerInput,
      }),
    },
    async resolve(query, _, { input: { question: questionId, answer: value } }, { user }) {
      const question = await prisma.question.findUniqueOrThrow({
        where: { id: questionId },
        include: { section: { include: { form: true } } },
      });
      const answer = prisma.answer.create({
        ...query,
        data: {
          questionId: questionId,
          answeredById: user?.id,
          ...castAnswer(value, question),
        },
      });
      publish(questionId, 'created', answer);
      publish(question.sectionId, 'created', answer);
      publish(question.section.formId, 'created', answer);
      return answer;
    },
  }),
);
