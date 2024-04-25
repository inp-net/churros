import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import omit from 'lodash.omit';
import {
  QuestionKindType,
  canEditForm,
  castAnswer,
  requiredIncludesForPermissions,
} from '../index.js';
import { QuestionOptionInputType } from '../types/question-option-input.js';
import { QuestionScaleInput } from '../types/question-scale-input.js';

builder.mutationField('upsertQuestion', (t) =>
  t.prismaFieldWithInput({
    description: 'Crée ou met à jour une question.',
    type: 'Question',
    input: {
      id: t.input.id({
        description:
          'Identifiant de la question à mettre à jour. Si non fourni, une nouvelle question sera créée.',
        required: false,
      }),
      formId: t.input.id({
        description:
          "Identifiant du formulaire auquel associer la question. Il n'es pas possible de changer le formulaire auquel une question est associée, si id est fourni, ce paramètre est ignoré.",
        required: false,
      }),
      sectionId: t.input.id({
        description:
          'Identifiant de la section de formulaire à laquelle associer la question. Si non fourni, la question est rajoutée à une section à titre vide, qui est créée au besoin. Pratique pour les formulaires plus simples sans section.',
        required: false,
      }),
      title: t.input.string({
        validate: { maxLength: 255, minLength: 1 },
      }),
      description: t.input.string({ defaultValue: '' }),
      order: t.input.int({
        description:
          'Position de la question dans la section. Si non spécifié, rajoute la question à la fin de la section.',
        required: false,
      }),
      type: t.input.field({
        type: QuestionKindType,
        required: true,
      }),
      mandatory: t.input.boolean({
        description: 'Indique si la question est obligatoire',
        required: true,
      }),
      anonymous: t.input.boolean({
        description: 'Indique si les réponses à la question sont anonymes',
        required: true,
      }),
      options: t.input.field({
        type: [QuestionOptionInputType],
        required: { list: false, items: true },
        validate: { minLength: 1 },
      }),
      allowOptionOther: t.input.boolean({
        description: 'Indique si la question doit avoir une option "Autre"',
        defaultValue: false,
      }),
      scale: t.input.field({
        type: QuestionScaleInput,
        required: false,
      }),
      allowedFiletypes: t.input.stringList({
        description: 'Types de fichiers autorisés pour les questions de type `FileUpload`',
        required: false,
      }),
      default: t.input.stringList({
        description: 'Valeur par défaut de la question. Voir `AnswerInput.answer` pour le format.',
        defaultValue: [],
      }),
    },
    validate: [
      [
        ({ input: { formId, sectionId, id } }) => Boolean(formId || sectionId || id),
        { message: 'Il faut fournir un formulaire ou une section pour créer une question' },
      ],
      [
        ({ input: { type, scale } }) => type !== 'Scale' || Boolean(scale),
        {
          message:
            'Il faut fournir `scale` pour les questions de type "Scale" (et pas pour les autres types de questions)',
        },
      ],
      [
        ({ input: { type, options } }) => type.startsWith('Select') || !options,
        {
          message:
            'Il faut fournir `options` pour les questions de type "Select" (et pas pour les autres types de questions)',
        },
      ],
      [
        ({ input: { type, allowedFiletypes } }) => type === 'FileUpload' || !allowedFiletypes,
        {
          message:
            'Il faut fournir `allowedFiletypes` pour les questions de type "FileUpload" (et pas pour les autres types de questions)',
        },
      ],
      [
        ({ input: { type, allowOptionOther } }) => type === 'SelectOne' || !allowOptionOther,
        {
          message:
            '`allowOptionOther` ne peut être `true` que si la question est de type "SelectOne"',
        },
      ],
    ],
    async authScopes(_, { input: { formId, sectionId, id } }, { user }) {
      const form = await prisma.form.findFirstOrThrow({
        where: {
          OR: [
            { id: formId ?? undefined },
            { sections: { some: { id: sectionId ?? undefined } } },
            { sections: { some: { questions: { some: { id: id ?? undefined } } } } },
          ],
        },
        include: requiredIncludesForPermissions,
      });
      return canEditForm(form, form.event, user);
    },
    async resolve(
      query,
      _,
      { input: { id, sectionId, formId, options, scale, ...input } },
      { user },
    ) {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");
      const ghostSectionId = async () => {
        const { id } = await prisma.formSection.upsert({
          where: { formId_order: { formId: formId!, order: 0 } },
          create: { title: '', description: '', formId: formId!, order: 0 },
          update: {},
        });
        return id;
      };

      const lastQuestionOrder = async () => {
        const questions = await prisma.question.findMany({
          where: { sectionId: sectionId ?? (await ghostSectionId()) },
          orderBy: { order: 'desc' },
        });
        return questions[0]?.order ?? -1;
      };

      const { answer: defaultAnswer } = castAnswer(
        input['default'],
        user.id,
        { ...input, scaleStart: scale?.minimum ?? null, scaleEnd: scale?.maximum ?? null },
        user,
      );
      const data = {
        ...omit(input, 'default'),
        allowedFiletypes: input.allowedFiletypes ?? [],
        order: input.order ?? (await lastQuestionOrder()) + 1,
        scaleStart: scale?.minimum,
        scaleEnd: scale?.maximum,
        options:
          options?.map(({ value }) => value) ??
          (scale ? [scale?.minimumLabel ?? '', scale?.maximumLabel ?? ''] : undefined),
        defaultAnswer,
      };

      if (formId && sectionId) {
        const sectionsOfForm = await prisma.formSection.findMany({
          where: { formId },
          orderBy: { order: 'asc' },
        });
        if (!sectionsOfForm.some((section) => section.id === sectionId)) {
          throw new GraphQLError(
            "La section à laquelle associer la question n'existe pas dans le formulaire",
          );
        }
      }

      return prisma.question.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          ...data,
          sectionId: sectionId ?? (await ghostSectionId()),
          jumps: {
            createMany: {
              data:
                options
                  ?.filter((o) => Boolean(o.jump))
                  .map((option) => ({
                    targetId: option.jump!,
                    value: option.value,
                  })) ?? [],
            },
          },
        },
        update: data,
      });
    },
  }),
);
