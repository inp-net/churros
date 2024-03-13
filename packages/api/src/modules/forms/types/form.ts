import { TYPENAMES_TO_ID_PREFIXES, builder, prisma, subscriptionName, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import {
  canAnswerForm,
  canEditForm,
  canSeeAllAnswers,
  canSeeForm,
  requiredIncludesForPermissions,
} from '../utils/permissions.js';

export const FormType = builder.prismaNode('Form', {
  description: 'Un formulaire',
  id: {
    field: 'id',
    description: `Préfixe de l'identifiant: \`${TYPENAMES_TO_ID_PREFIXES.Form}:\``,
  },
  include: requiredIncludesForPermissions,
  authScopes({ createdById, event }, { user }) {
    return canSeeForm({ createdById }, event, user);
  },
  fields: (t) => ({
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
    event: t.relation('event', { nullable: true, description: 'Événement associé au formulaire' }),
    canEdit: t.boolean({
      description: "Indique si l'utilisateur peut éditer le formulaire.",
      resolve: ({ createdById, event }, {}, { user }) => {
        return canEditForm({ createdById }, event, user);
      },
    }),
    canAnswer: t.boolean({
      description: "Indique si l'utilisateur peut répondre au formulaire.",
      resolve: async ({ event, opensAt, closesAt }, {}, { user }) => {
        return canAnswerForm({ opensAt, closesAt }, event, user);
      },
    }),
    canSeeAnswers: t.boolean({
      description: "Indique si l'utilisateur peut voir les réponses au formulaire.",
      resolve: async ({ createdById, event }, _args, { user }) => {
        return canSeeAllAnswers({ createdById }, event, user);
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
        "Sections du formulaire. Un formulaire contient toujours au moins une section (sauf s'il n'y a aucune question).",
      query: {
        orderBy: { order: 'asc' },
      },
    }),
    section: t.prismaField({
	description: "Une section du formulaire.",
	args: { id: t.arg.id() },
	query: async ({ id: formId }, { id }) => prisma.formSection.findFirst({ where: { formId, id }})
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
    answerCount: t.int({
      description: 'Nombre de réponses au formulaire',
      subscribe(subs, { id }) {
        subs.register(subscriptionName(id));
      },
      resolve: async ({ id }) => {
        return prisma.answer.count({ where: { question: { section: { formId: id } } } });
      },
    }),
    hasSections: t.boolean({
    description: "Vrai si le formulaire comporte des sections",
    resolve: async ({ id }) => (await prisma.section.count({ where: { formId: id, title: { not: '' } } })) > 0 
    })
  }),
});
