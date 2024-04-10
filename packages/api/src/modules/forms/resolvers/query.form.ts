import { TYPENAMES_TO_ID_PREFIXES, builder, makeGlobalID, prisma } from '#lib';
import { FormType } from '../types/form.js';
import { canSeeForm, requiredIncludesForPermissions } from '../utils/permissions.js';

builder.queryField('form', (t) =>
  t.prismaField({
    type: FormType,
    nullable: true,
    description:
      'Récupère un formulaire. On peut utiliser une subscription pour avoir la mise à jour en temps réel des réponses au formulaire.',
    args: {
      localId: t.arg.string({
        required: true,
        description: `Identifiant local (sans le préfixe \`${TYPENAMES_TO_ID_PREFIXES.Form}:\`) du formulaire`,
      }),
    },
    smartSubscription: true,
    async authScopes(_, { localId }, { user }) {
      const form = await prisma.form.findUnique({
        include: requiredIncludesForPermissions,
        where: { id: makeGlobalID('Form', localId) },
      });
      if (!form) return true;
      return canSeeForm(form, form.event, user);
    },
    resolve: async (query, _, { localId }) =>
      prisma.form.findUnique({ ...query, where: { id: makeGlobalID('Form', localId) } }),
  }),
);
