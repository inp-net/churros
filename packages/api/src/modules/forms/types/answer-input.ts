import { builder, prisma } from '#lib';
import { parse } from 'date-fns';

export const AnswerInput = builder.inputType('AnswerInput', {
  fields: (t) => ({
    question: t.id({
      required: true,
      description: 'ID de la question à laquelle répondre',
    }),
    answer: t.stringList({
      required: true,
      description: `
Réponse à la question. Pour les questions à une seule réponse, ne mettre qu'un seul élément.
    
- Pour les questions de type \`Date\`, utiliser le format \`YYYY-mm-dd\`
- Pour les questions de type \`Time\`, utiliser le format \`HH:MM:ss\`
- Pour les questions de type \`Scale\`, utiliser simplement le nombre répondu par l'utilisateur·ice
- Pour les questions de type \`FileUpload\`, utiliser la mutation [\`answerFileQuestion\`](#mutation/answerFileQuestion)
      `,
    }),
  }),
  validate: [
    [
      async ({ question, answer }) => {
        const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
        return type === 'SelectMultiple' || answer.length <= 1;
      },
      { message: "Cette question n'accepte pas plusieurs réponses" },
    ],
    [
      async ({ question, answer }) => {
        const { mandatory } = await prisma.question.findUniqueOrThrow({
          where: { id: question },
        });
        // filter out empty-string answers
        return !mandatory || answer.some(Boolean);
      },
      {
        message: 'Cette question est obligatoire',
      },
    ],
    [
      async ({ question, answer }) => {
        const { type, scaleStart, scaleEnd } = await prisma.question.findUniqueOrThrow({
          where: { id: question },
        });
        if (type !== 'Scale') return true;
        if (answer.length === 0) return true;

        const number = Number.parseFloat(answer[0]!);
        return number >= scaleStart! && number <= scaleEnd!;
      },
      {
        message: "La réponse doit être entre les bornes de l'échelle.",
      },
    ],
    [
      async ({ question, answer }) => {
        const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
        if (type !== 'Scale') return true;
        if (answer.length === 0) return true;
        const numberValue = Number.parseFloat(answer[0]!);
        return Math.floor(numberValue) === numberValue;
      },
      {
        message: 'La réponse doit être un entier',
      },
    ],
    [
      async ({ question, answer }) => {
        const { type, options, allowOptionOther } = await prisma.question.findUniqueOrThrow({
          where: { id: question },
        });
        if (type !== 'SelectOne' && type !== 'SelectMultiple') return true;
        if (answer.length === 0) return true;
        return allowOptionOther || answer.every((a) => options.includes(a));
      },
      {
        message: 'Cette réponse n’est pas une option valide',
      },
    ],
    [
      async ({ question, answer }) => {
        const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
        if (!['Number', 'Scale'].includes(type)) return true;
        if (answer.length === 0) return true;
        return !Number.isNaN(Number.parseFloat(answer[0]!));
      },
      {
        message: 'Cette réponse doit être un nombre',
      },
    ],
    [
      async ({ question, answer }) => {
        const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
        if (type !== 'Date') return true;
        if (answer.length === 0) return true;
        try {
          parse(answer[0]!, 'yyyy-MM-dd', new Date());
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Cette réponse doit être une date au format YYYY-MM-DD',
      },
    ],
    [
      async ({ question, answer }) => {
        const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
        if (type !== 'Time') return true;
        if (answer.length === 0) return true;
        try {
          parse(answer[0]!, 'HH:mm:ss', new Date());
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Cette réponse doit être une heure au format HH:MM:SS',
      },
    ],
    [
      async ({ question, answer }) => {
        const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
        if (type !== 'Text') return true;
        if (answer.length === 0) return true;
        return answer[0]!.length <= 500;
      },
      {
        message: 'Cette réponse doit faire moins de 500 caractères',
      },
    ],
    [
      async ({ question }) => {
        const { type } = await prisma.question.findUniqueOrThrow({ where: { id: question } });
        return type !== 'FileUpload';
      },
      {
        message:
          'Utilisez la mutation `answerFileQuestion` pour répondre à une question de type `FileUpload`.',
      },
    ],
  ],
});
