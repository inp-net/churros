import { builder, prisma, publish } from '#lib';
import { FileScalar } from '#modules/global';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AnswerFileUploadType, formAnswerFilePath } from '../index.js';

builder.mutationField('answerFileQuestion', (t) =>
  t.field({
    description: 'Répondre à une question de type `FileUpload` en uploadant un fichier',
    type: AnswerFileUploadType,
    args: {
      question: t.arg.id({
        required: true,
        description: 'ID de la question à laquelle répondre',
      }),
      answer: t.arg({
        required: true,
        description: 'Fichier à uploader',
        type: FileScalar,
      }),
    },
    validate: [
      [
        async ({ question }) => {
          const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
          return type === 'FileUpload';
        },
        {
          message:
            'Utilisez la mutation `answerQuestion` pour répondre à une question de type autre que `FileUpload`.',
        },
      ],
    ],
    async resolve(_, { question: questionId, answer: file }, { user }) {
      const question = await prisma.question.findUniqueOrThrow({
        where: { id: questionId },
        include: { section: { include: { form: true } } },
      });
      const buffer = await file.arrayBuffer().then((array) => Buffer.from(array));
      const root = new URL(process.env.STORAGE).pathname;
      let answer = await prisma.answer.create({
        data: {
          questionId,
          createdById: user?.id,
          answer: [],
        },
      });
      try {
        const filepath = formAnswerFilePath(
          root,
          question.section.form,
          question,
          answer,
          path.extname(file.name),
        );
        mkdirSync(path.dirname(filepath), { recursive: true });
        writeFileSync(filepath, buffer);
        answer = await prisma.answer.update({
          where: { id: answer.id },
          data: {
            answer: [path.relative(root, filepath)],
          },
        });
        publish(questionId, 'created', answer);
        publish(question.sectionId, 'created', answer);
        publish(question.section.formId, 'created', answer);
        return answer;
      } catch (error) {
        await prisma.answer.delete({ where: { id: answer.id } });
        throw error;
      }
    },
  }),
);
