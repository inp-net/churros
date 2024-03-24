import { builder } from '#lib';
import { AnswerType } from './answer.js';
import { QuestionFileUploadType } from './question-file-upload.js';

export const AnswerFileUploadType = builder.prismaObject('Answer', {
  variant: 'AnswerFileUpload',
  description: `Réponse de type \`FileUpload\` (voir [\`QuestionKind\`](#QuestionKind))`,
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [AnswerType],
  fields: (t) => ({
    value: t.field({
      type: 'String',
      nullable: true,
      description: 'Réponse donnée',
      resolve: ({ answer }) => answer[0],
    }),
    question: t.relation('question', {
      type: QuestionFileUploadType,
      description: 'Question à laquelle la réponse est associée',
    }),
  }),
});
