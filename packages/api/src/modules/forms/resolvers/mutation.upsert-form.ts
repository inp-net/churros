import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { userCanManageEvent } from '../../../permissions/manager.js';
import { FormType } from '../types/form.js';
import { canEditForm, requiredIncludesForPermissions } from '../utils/permissions.js';

builder.mutationField('upsertForm', (t) =>
  t.prismaFieldWithInput({
    description:
      "Crée ou met à jour un formulaire. À la création, une section de formulaire vide sans titre est automatiquement créée. C'est pratique pour les formulaires sans section.",
    type: FormType,
    input: {
      id: t.input.id({
        description:
          'Identifiant du formulaire à mettre à jour. Si non fourni, un nouveau formulaire sera créé.',
        required: false,
      }),
      opensAt: t.input.field({
        type: DateTimeScalar,
        required: false,
      }),
      closesAt: t.input.field({
        type: DateTimeScalar,
        required: false,
      }),
      title: t.input.string({
        validate: { maxLength: 255 },
      }),
      description: t.input.string({ defaultValue: '' }),
      eventId: t.input.id({
        description: "Identifiant de l'événement à associer au formulaire",
        required: false,
      }),
    },
    async authScopes(_, { input: { id, eventId } }, { user }) {
      if (id) {
        const form = await prisma.form.findUniqueOrThrow({
          where: { id },
          include: requiredIncludesForPermissions,
        });
        return canEditForm(form, form.event, user);
      } else if (eventId) {
        const event = await prisma.event.findUniqueOrThrow({
          where: { id: eventId },
          include: requiredIncludesForPermissions.event.include,
        });
        return userCanManageEvent(event, user, { canEdit: true });
      } else {
        return Boolean(user);
      }
    },
    async resolve(query, _, { input: { id, ...input } }, { user }) {
      const data = {
        ...input,
      };
      return prisma.form.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          ...data,
          createdById: user?.id,
        },
        update: {
          ...data,
        },
      });
    },
  }),
);
