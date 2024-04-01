import { builder, ensureHasIdPrefix, log, prisma, publish } from '#lib';
import { FormType } from '../types/form.js';
import {
  canSetFormAnswerCheckboxes,
  requiredIncludesForPermissions,
} from '../utils/permissions.js';

builder.mutationField('setFormAnswersCheckbox', (t) =>
  t.prismaField({
    type: FormType,
    description:
      'Coche ou décoche la case à cocher à côté des réponses à un formulaire pour un·e utilisateur·ice.',
    args: {
      form: t.arg.string({ description: "L'ID du formulaire" }),
      userId: t.arg.id({ description: "ID de l'utilisateur·ice" }),
      checked: t.arg.boolean({ description: 'Vrai pour cocher la case, faux pour la décocher' }),
    },
    async authScopes(_, { form: formId }, { user }) {
      formId = ensureHasIdPrefix(formId, 'Form');
      const form = await prisma.form.findUniqueOrThrow({
        where: { id: formId },
        include: requiredIncludesForPermissions,
      });
      return canSetFormAnswerCheckboxes(form, form.event, user);
    },
    async resolve(query, _, { form: formId, userId, checked }, { user }) {
      await log('forms', 'set-checkbox', { formId, userId, checked }, userId, user);
      const result = prisma.form.update({
        ...query,
        where: {
          id: formId,
        },
        data: {
          markedCheckboxes: checked
            ? {
                connect: { id: userId },
              }
            : {
                disconnect: { id: userId },
              },
        },
      });
      publish(formId, 'updated', { userId });
      return result;
    },
  }),
);
