import { TYPENAMES_TO_ID_PREFIXES, builder, toHtml } from '#lib';
import {
  canSeeAllAnswers,
  canSeeForm,
  requiredIncludesForPermissions,
} from '../utils/permissions.js';
import { QuestionKindType } from './question-kind.js';

export const QuestionType = builder.prismaInterface('Question', {
  description: 'Une question dans un formulaire',
  include: {
    goToSection: true,
    section: {
      include: {
        form: {
          include: requiredIncludesForPermissions,
        },
      },
    },
  },
  authScopes(
    {
      section: {
        form: { createdById, event },
      },
    },
    { user },
  ) {
    return canSeeForm({ createdById }, event, user);
  },
  fields: (t) => ({
    id: t.exposeID('id', {
      description: `Préfixe d'identifiant: ${TYPENAMES_TO_ID_PREFIXES.Question}:`,
    }),
    section: t.relation('section', {
      description: 'Section du formulaire dans laquelle est la question',
    }),
    title: t.exposeString('title', { description: 'Titre de la question' }),
    description: t.exposeString('description', {
      nullable: true,
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

    answers: t.relatedConnection('answers', {
      authScopes(
        {
          section: {
            form: { createdById, event },
          },
        },
        {},
        { user },
      ) {
        return canSeeAllAnswers({ createdById }, event, user);
      },
      cursor: 'id',
    }),
  }),
});
