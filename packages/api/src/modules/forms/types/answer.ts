import { TYPENAMES_TO_ID_PREFIXES, builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { answerToString } from '../utils/answers.js';
import { canSeeAllAnswers, requiredIncludesForPermissions } from '../utils/permissions.js';

export const answerTypePrismaIncludes = {
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
};

export const AnswerType = builder.prismaInterface('Answer', {
  description:
    'Une réponse à un formulaire. Les réponses peuvent être de plusieurs types différents (en fonction de la question).',
  include: answerTypePrismaIncludes,
  async authScopes({ createdById, question }, { user }) {
    if (!user) return false;
    if (!('section' in question)) {
      question = await prisma.question.findUniqueOrThrow({
        // @ts-expect-error TS doesn't know, but question might not have the includes we expect. see form.answers-by-user.ts
        where: { id: question.id },
        include: answerTypePrismaIncludes.question.include,
      });
    }
    return (
      createdById === user.id ||
      canSeeAllAnswers(question.section.form, question.section.form.event, user)
    );
  },
  resolveType({ question: { type } }) {
    switch (type) {
      case 'Text': {
        return 'AnswerText';
      }
      case 'LongText': {
        return 'AnswerLongText';
      }
      case 'SelectOne': {
        return 'AnswerSelectOne';
      }
      case 'SelectMultiple': {
        return 'AnswerSelectMultiple';
      }
      case 'FileUpload': {
        return 'AnswerFileUpload';
      }
      case 'Scale': {
        return 'AnswerScale';
      }
      case 'Number': {
        return 'AnswerNumber';
      }
      case 'Date': {
        return 'AnswerDate';
      }
      case 'Time': {
        return 'AnswerTime';
      }
      default: {
        throw new Error(`Type de question inconnu: ${type}`);
      }
    }
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
    createdBy: t.relation('createdBy', {
      nullable: true,
      description: 'Utilisateur ayant répondu à la question',
    }),
    form: t.prismaField({
      type: 'Form',
      resolve: (query, { question: { section } }) =>
        prisma.form.findUniqueOrThrow({ ...query, where: { id: section.formId } }),
      description: 'Formulaire auquel appartient la question',
    }),
    section: t.prismaField({
      type: 'FormSection',
      resolve: (query, { question: { sectionId } }) =>
        prisma.formSection.findUniqueOrThrow({ ...query, where: { id: sectionId } }),
      description: 'Section du formulaire auquel appartient la question',
    }),
    booking: t.relation('booking', {
      nullable: true,
      description: 'Réservation associée à la réponse',
    }),
    question: t.relation('question'),
    answerString: t.string({ resolve: (answer, {}, { user }) => answerToString(answer, user) }),
    checkboxIsMarked: t.boolean({
      nullable: true,
      async resolve(
        {
          createdById,
          question: {
            section: { form },
          },
        },
        {},
      ) {
        if (!form.enableAnswersCompletionCheckbox) return null;
        if (!createdById) return null;

        const { markedCheckboxes } = await prisma.form.findUniqueOrThrow({
          where: { id: form.id },
          include: { markedCheckboxes: true },
        });
        return markedCheckboxes.some((checkbox) => checkbox.id === createdById);
      },
    }),
  }),
});
