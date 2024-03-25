import { builder, prisma, splitID, toHtml } from '#lib';
import {
  canSeeAllAnswers,
  canSeeForm,
  requiredIncludesForPermissions,
} from '../utils/permissions.js';
import { AnswerType } from './answer.js';

export const FormSectionType = builder.prismaObject('FormSection', {
  description:
    "Une section d'un formulaire. Les sections sont utiles pour séparer les questions en plusieurs parties, dont certaines peuvent être affichées selon des réponses à des questions précédentes",
  include: {
    form: {
      include: requiredIncludesForPermissions,
    },
  },
  authScopes({ form, form: { event } }, { user }) {
    return canSeeForm(form, event, user);
  },
  fields: (t) => ({
    id: t.exposeID('id'),
    localId: t.string({
      resolve: ({ id }) => splitID(id)[1],
      description: 'Identifiant local de la section du formulaire',
    }),
    order: t.exposeInt('order', { description: 'Ordre de la section dans le formulaire' }),
    form: t.relation('form', { description: 'Formulaire auquel appartient la section' }),
    title: t.exposeString('title', { description: 'Titre de la section' }),
    description: t.exposeString('description', {
      description: 'Description en Markdown de la section',
    }),
    descriptionHtml: t.string({
      resolve: ({ description }) => toHtml(description),
      description: 'Description en HTML de la section',
    }),
    questions: t.relation('questions', {
      description: 'Questions dans section',
      query: {
        orderBy: { order: 'asc' },
      },
    }),
    answers: t.prismaConnection({
      type: AnswerType,
      cursor: 'id',
      description: 'Réponses à cette section',
      authScopes({ form: { createdById, event, group } }, {}, { user }) {
        return canSeeAllAnswers({ createdById, group }, event, user);
      },
      resolve: (query, { id }) =>
        prisma.answer.findMany({
          ...query,
          where: { question: { sectionId: id } },
          orderBy: [
            {
              questionId: 'asc',
            },
          ],
        }),
    }),
    restrictedToGroups: t.relation('restrictedToGroups', {
      description:
        'Si non vide, seul·e·s les membres des groupes spécifiés peuvent accéder à cette section. ',
    }),
  }),
});
