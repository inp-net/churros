import { builder } from '#lib';
import { QuestionType } from './question.js';

export const QuestionFileUploadType = builder.prismaObject('Question', {
  variant: 'QuestionFileUpload',
  // @ts-expect-error works even though TS complains, idk why
  interfaces: [QuestionType],
  description: 'Question de type `FileUpload`',
  fields: (t) => ({
    allowedFileTypes: t.stringList({
      nullable: true,
      description:
        "Types de fichiers autorisés pour les questions de type `File`. Null si la question n'est pas de type `File`.",
      resolve({ type, allowedFiletypes }) {
        return type === 'FileUpload' ? allowedFiletypes : null;
      },
    }),
  }),
});
