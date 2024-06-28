import { builder, prisma } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { Visibility } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import omit from 'lodash.omit';
import { FormType } from '../types/form.js';
import {
  canCreateForm,
  canEditForm,
  requiredIncludesForPermissions,
} from '../utils/permissions.js';

builder.mutationField('upsertForm', (t) =>
  t.prismaFieldWithInput({
    description:
      "Crée ou met à jour un formulaire. À la création, une section de formulaire vide sans titre est automatiquement créée. C'est pratique pour les formulaires sans section.",
    type: FormType,
    validate: [
      [
        ({ input: { visibility, group } }) => (group ? Boolean(visibility) : true),
        {
          message: 'La visibilité est requise pour les formulaires associés à un groupe.',
          path: ['visibility'],
        },
      ],
      [
        ({ input: { visibility, group } }) =>
          group ? true : !visibility || visibility === Visibility.Unlisted,
        {
          message: 'Les formulaires non associés à un groupe doivent être non répertoriés.',
          path: ['visibility'],
        },
      ],
    ],
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
      visibility: t.input.field({
        type: VisibilityEnum,
        defaultValue: Visibility.Unlisted,
      }),
      group: t.input.string({
        description: 'UID du groupe auquel le formulaire est associé.',
        required: false,
      }),
    },
    async authScopes(_, { input }, { user }) {
      if (input.id) {
        const form = await prisma.form.findUniqueOrThrow({
          where: { id: input.id },
          include: requiredIncludesForPermissions,
        });
        return canEditForm(form, form.event, user);
      }

      const event = input.eventId
        ? await prisma.event.findUniqueOrThrow({
            where: { id: input.eventId },
            include: requiredIncludesForPermissions.event.include,
          })
        : null;
      const group = input.group ? { uid: input.group } : null;
      return canCreateForm(group, event, user);
    },
    async resolve(query, _, { input }, { user }) {
      if (!user) throw new GraphQLError('Vous devez être connecté pour effectuer cette action.');

      const data = omit(input, 'id', 'eventId', 'group');

      if (input.id) {
        return prisma.form.update({
          ...query,
          where: { id: input.id },
          data: {
            ...data,
            group: input.group ? { connect: { uid: input.group } } : { disconnect: {} },
          },
        });
      }

      return prisma.form.create({
        ...query,
        data: {
          ...data,
          group: input.group ? { connect: { uid: input.group } } : undefined,
          createdBy: { connect: { id: user.id } },
          sections: {
            create: {
              title: '',
              description: '',
              order: 1,
            },
          },
        },
      });
    },
  }),
);
