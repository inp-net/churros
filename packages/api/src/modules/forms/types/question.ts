import { TYPENAMES_TO_ID_PREFIXES, builder, prisma, toHtml } from '#lib';
import { canSeeForm, requiredIncludesForPermissions } from '../utils/permissions.js';
import { QuestionKindType } from './question-kind.js';

export const QuestionType = builder.prismaInterface('Question', {
  name: 'Question',
  description: 'Une question dans un formulaire',
  include: {
    jumps: true,
    section: {
      include: {
        form: {
          include: requiredIncludesForPermissions,
        },
      },
    },
  },
  async authScopes({ section, id }, { user }) {
    if (!section) {
      section = await prisma.question
        .findUniqueOrThrow({
          where: { id },
        })
        .section({
          include: {
            form: {
              include: requiredIncludesForPermissions,
            },
          },
        });
    }
    return canSeeForm(section.form, section.form.event, user);
  },
  resolveType({ type }) {
    switch (type) {
      case 'SelectOne': {
        return 'QuestionSelectOne';
      }
      case 'SelectMultiple': {
        return 'QuestionSelectMultiple';
      }
      case 'FileUpload': {
        return 'QuestionFileUpload';
      }
      case 'Scale': {
        return 'QuestionScale';
      }
      default: {
        return 'QuestionScalar';
      }
    }
  },
  fields: (t) => ({
    id: t.exposeID('id', {
      description: `Préfixe d'identifiant: ${TYPENAMES_TO_ID_PREFIXES.Question}:`,
    }),
    section: t.relation('section', {
      description: 'Section du formulaire dans laquelle est la question',
    }),
    title: t.exposeString('title', { description: 'Titre de la question' }),
    order: t.exposeInt('order', { description: 'Ordre de la question dans la section' }),
    description: t.exposeString('description', {
      description: 'Description en Markdown de la question',
    }),
    descriptionHtml: t.string({
      resolve: ({ description }) => toHtml(description),
      description: 'Description en HTML de la question',
    }),
    type: t.expose('type', { description: 'Type de la question', type: QuestionKindType }),
    mandatory: t.exposeBoolean('mandatory', {
      description: 'Indique si la question est obligatoire',
    }),
    anonymous: t.exposeBoolean('anonymous', {
      description:
        "Indique si la réponse à la question est anonyme. Si oui, les personnes pouvant voir les réponses ne pouront jamais savoir la réponse d'une personne à la question",
    }),
  }),
});
