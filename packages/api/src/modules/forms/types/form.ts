import {
  TYPENAMES_TO_ID_PREFIXES,
  builder,
  ensureHasIdPrefix,
  prisma,
  splitID,
  toHtml,
} from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import {
  canAnswerForm,
  canEditForm,
  canModifyFormAnswers,
  canSeeAllAnswers,
  canSeeAnswerStats,
  canSeeForm,
  canSetFormAnswerCheckboxes,
  requiredIncludesForPermissions,
} from '../utils/permissions.js';
import { FormSectionType } from './form-section.js';

export const FormType = builder.prismaNode('Form', {
  description: 'Un formulaire',
  id: {
    field: 'id',
    description: `Préfixe de l'identifiant: \`${TYPENAMES_TO_ID_PREFIXES.Form}:\``,
  },
  include: requiredIncludesForPermissions,
  authScopes({ createdById, event, group, visibility }, { user }) {
    return canSeeForm({ createdById, group, visibility }, event, user);
  },
  fields: (t) => ({
    localId: t.string({
      resolve: ({ id }) => splitID(id)[1],
      description: 'Identifiant local du formulaire',
    }),
    createdAt: t.expose('createdAt', {
      type: DateTimeScalar,
      description: 'Date de création du formulaire',
    }),
    updatedAt: t.expose('updatedAt', {
      type: DateTimeScalar,
      description: 'Date de dernière mise à jour du formulaire',
    }),
    createdBy: t.relation('createdBy', {
      nullable: true,
      description: 'Utilisateur ayant créé le formulaire',
    }),
    group: t.relation('group', {
      nullable: true,
      description: 'Groupe auquel le formulaire est associé',
    }),
    visibility: t.expose('visibility', {
      type: VisibilityEnum,
      description: 'Visibilité du formulaire',
    }),
    event: t.relation('event', { nullable: true, description: 'Événement associé au formulaire' }),
    canEdit: t.boolean({
      description: "Indique si l'utilisateur peut éditer le formulaire.",
      resolve: ({ createdById, event }, {}, { user }) => {
        return canEditForm({ createdById }, event, user);
      },
    }),
    canAnswer: t.boolean({
      description: "Indique si l'utilisateur peut répondre au formulaire.",
      resolve: async (form, {}, { user }) => {
        const userContributions = user
          ? await prisma.contribution.findMany({
              where: {
                userId: user?.id,
              },
              include: {
                option: {
                  include: {
                    paysFor: true,
                  },
                },
              },
            })
          : [];
        return canAnswerForm(form, form.event, user, userContributions);
      },
    }),
    canModifyAnswers: t.boolean({
      description: "Indique si l'utilisateur·ice peut modifier ses réponses au formulaire.",
      resolve: async (form, {}, { user }) => {
        const userContributions = user
          ? await prisma.contribution.findMany({
              where: {
                userId: user?.id,
              },
              include: {
                option: {
                  include: {
                    paysFor: true,
                  },
                },
              },
            })
          : [];
        return canModifyFormAnswers(form, form.event, user, userContributions);
      },
    }),
    canSeeAnswers: t.boolean({
      description: "Indique si l'utilisateur peut voir les réponses au formulaire.",
      resolve: async (form, _args, { user }) => {
        return canSeeAllAnswers(form, form.event, user);
      },
    }),
    canSeeAnswerStats: t.boolean({
      description:
        "Indique si l'utilisateur peut voir les statistiques des réponses au formulaire.",
      resolve: async (form, _args, { user }) => {
        const formWithQuestions = await prisma.form.findUniqueOrThrow({
          where: { id: form.id },
          include: {
            group: true,
            sections: { include: { questions: true } },
          },
        });

        return canSeeAnswerStats(formWithQuestions, form.event, user);
      },
    }),
    canSetCheckboxes: t.boolean({
      description:
        "Indique si l'utilisateur peut cocher ou décocher les cases à cocher à côté des réponses au formulaire.",
      resolve: async (form, _args, { user }) => {
        return canSetFormAnswerCheckboxes(form, form.event, user);
      },
    }),
    opensAt: t.expose('opensAt', {
      type: DateTimeScalar,
      nullable: true,
      description: "Date d'ouverture du formulaire.",
    }),
    closesAt: t.expose('closesAt', {
      type: DateTimeScalar,
      nullable: true,
      description: 'Date de fermeture du formulaire.',
    }),
    title: t.exposeString('title'),
    description: t.exposeString('description', {
      nullable: true,
      description: 'Description en Markdown du formulaire.',
    }),
    descriptionHtml: t.string({
      resolve: ({ description }) => toHtml(description),
      description: 'Description en HTML du formulaire.',
    }),
    sections: t.relation('sections', {
      description:
        "Sections du formulaire. Un formulaire contient toujours au moins une section (sauf s'il n'y a aucune question). Uniquement accessible par celleux qui peuvent modifier le formulaire. Utiliser `nextSection` pour afficher une section dans le but d'y répondre.",
      authScopes(form, _, { user }) {
        return canEditForm(form, form.event, user);
      },
      query: {
        orderBy: { order: 'asc' },
      },
    }),
    section: t.prismaField({
      description: 'Une section du formulaire.',
      type: FormSectionType,
      args: {
        id: t.arg.string({
          required: false,
          description: 'Identifiant (local ou global) de la section',
        }),
      },
      resolve: async (query, { id: formId }, { id }) =>
        prisma.formSection.findFirstOrThrow({
          ...query,
          where: { formId, id: id ? ensureHasIdPrefix(id, 'FormSection') : undefined },
        }),
    }),
    questions: t.prismaConnection({
      type: 'Question',
      description:
        'Questions du formulaire. Liste de toutes les questions, peut importe la section dans laquelle elles se trouvent.',
      cursor: 'id',
      resolve: async (query, { id }) => {
        return prisma.question.findMany({
          ...query,
          where: { section: { formId: id } },
          orderBy: [
            {
              section: {
                order: 'asc',
              },
            },
            {
              order: 'asc',
            },
          ],
        });
      },
    }),
    hasSections: t.boolean({
      description: 'Vrai si le formulaire comporte des sections',
      resolve: async ({ id }) =>
        (await prisma.formSection.count({ where: { formId: id, title: { not: '' } } })) > 0,
    }),
    checkboxesAreEnabled: t.exposeBoolean('enableAnswersCompletionCheckbox'),
  }),
});
