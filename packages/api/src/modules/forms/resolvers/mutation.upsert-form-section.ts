import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { canEditForm, requiredIncludesForPermissions } from '../index.js';

builder.mutationField('upsertFormSection', (t) =>
  t.prismaFieldWithInput({
    description: 'Crée ou met à jour une section de formulaire.',
    type: 'FormSection',
    input: {
      id: t.input.id({
        description:
          'Identifiant de la section à mettre à jour. Si non fourni, une nouvelle section sera créée.',
        required: false,
      }),
      formId: t.input.id({
        description:
          "Identifiant du formulaire auquel associer la section. Il n'es pas possible de changer le formulaire auquel une section est associée, si id est fourni, ce paramètre est ignoré.",
        required: true,
      }),
      title: t.input.string({
        validate: { maxLength: 255 },
      }),
      description: t.input.string({ defaultValue: '' }),
      order: t.input.int({
        description:
          'Position de la section dans le formulaire. Si non spécifié, la section est ajoutée à la fin du formulaire',
        required: false,
      }),
    },
    async authScopes(_, { input: { formId } }, { user }) {
      const form = await prisma.form.findUniqueOrThrow({
        where: { id: formId },
        include: requiredIncludesForPermissions,
      });
      return canEditForm(form, form.event, user);
    },
    async resolve(query, _, { input: { id, formId, ...input } }) {
      const data = {
        ...input,
        order: input.order ?? (await prisma.formSection.count({ where: { formId } })),
      };
      return prisma.formSection.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          ...data,
          formId,
        },
        update: data,
      });
    },
  }),
);
