import { builder, prisma, subscriptionName } from '#lib';
import { FormType } from '../types/form.js';

builder.prismaObjectField(FormType, 'answerCount', (t) =>
  t.int({
    description: 'Nombre de réponses au formulaire',
    subscribe(subs, { id }) {
      subs.register(subscriptionName(id));
    },
    async resolve({ id }) {
      // Waiting for https://github.com/prisma/prisma/issues/4228
      const result: [{ count: bigint }] = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT("createdById")) 
            FROM "Answer" 
            JOIN "Question" ON "Answer"."questionId" = "Question".id
            JOIN "FormSection" ON "Question"."sectionId" = "FormSection".id
            WHERE "FormSection"."formId" = ${id} 
        `;
      return Number(result[0].count);
    },
  }),
);
