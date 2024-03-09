import { TYPENAMES_TO_ID_PREFIXES, builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { canSeeAllAnswers, requiredIncludesForPermissions } from '../utils/permissions.js';
import { FormSectionType } from './form-section.js';
import { FormType } from './form.js';

export const AnswerType = builder.prismaInterface('Answer', {
  description:
    'Une réponse à un formulaire. Les réponses peuvent être de plusieurs types différents (en fonction de la question).',
  include: {
    question: {
      include: {
        section: {
          include: {
            form: {
              include: requiredIncludesForPermissions,
            },
          },
        },
      },
    },
  },
  authScopes(
    {
      answeredById,
      question: {
        section: {
          form: { createdById, event },
        },
      },
    },
    { user },
  ) {
    if (!user) return false;
    return answeredById === user.id || canSeeAllAnswers({ createdById }, event, user);
  },
  fields: (t) => ({
    id: t.exposeID('id', {
      description: `Préfixe de l'identifiant: \`${TYPENAMES_TO_ID_PREFIXES.Answer}:\``,
    }),
    createdAt: t.expose('createdAt', {
      type: DateTimeScalar,
      description: 'Date de création de la réponse',
    }),
    updatedAt: t.expose('updatedAt', {
      type: DateTimeScalar,
      description: 'Date de dernière mise à jour de la réponse',
    }),
    createdBy: t.relation('answeredBy', {
      nullable: true,
      description: 'Utilisateur ayant répondu à la question',
    }),
    form: t.field({
      type: FormType,
      resolve: ({ question }) => question.section.form,
      description: 'Formulaire auquel appartient la question',
    }),
    section: t.field({
      type: FormSectionType,
      resolve: ({ question }) => question.section,
      description: 'Section du formulaire auquel appartient la question',
    }),
    booking: t.relation('booking', {
      nullable: true,
      description: 'Réservation associée à la réponse',
    }),
  }),
});
