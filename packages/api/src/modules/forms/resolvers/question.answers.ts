import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { QuestionType, canSeeAllAnswers, requiredIncludesForPermissions } from '../index.js';

builder.prismaInterfaceField(QuestionType, 'answers', (t) =>
  t.relatedConnection('answers', {
    cursor: 'id',
    args: {
      by: t.arg.string({
        required: false,
        description: "Récupérer uniquement les réponses d'un utilisateur, par son uid.",
      }),
    },
    query({ by }) {
      if (by) {
        return {
          where: { createdBy: { uid: by } },
        };
      }
      return {};
    },
    async authScopes({ sectionId }, { by }, { user }) {
      const form = await prisma.form.findFirstOrThrow({
        where: { sections: { some: { id: sectionId } } },
        include: requiredIncludesForPermissions,
      });
      return (by && user && by === user.uid) || canSeeAllAnswers(form, form.event, user);
    },
  }),
);
