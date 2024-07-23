import { builder, ensureGlobalId, prisma } from '#lib';
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
      formId: t.input.string({
        description:
          "Identifiant du formulaire auquel associer la section. Il n'es pas possible de changer le formulaire auquel une section est associée, si id est fourni, ce paramètre est ignoré. L'ID peut être local",
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
    async authScopes(_, { input: { formId: formIdRaw } }, { user }) {
      const formId = ensureGlobalId(formIdRaw, 'Form');
      const form = await prisma.form.findUniqueOrThrow({
        where: { id: formId },
        include: requiredIncludesForPermissions,
      });
      return canEditForm(form, form.event, user);
    },
    async resolve(query, _, { input: { id, formId: formIdRaw, ...input } }) {
      const formId = ensureGlobalId(formIdRaw, 'Form');
      // Figure out the section's order if we are creating a new section
      const defaultOrder = async () => {
        // get next available order
        const maxOrderSection = await prisma.formSection.findFirst({
          where: { formId },
          orderBy: { order: 'desc' },
        });
        return (maxOrderSection?.order ?? 0) + 1;
      };

      return id
        ? prisma.formSection.update({
            ...query,
            where: { id },
            data: { ...input, order: input.order ?? undefined },
          })
        : prisma.formSection.create({
            ...query,
            data: {
              ...input,
              order: input.order ?? (await defaultOrder()),
              formId,
            },
          });
    },
  }),
);
