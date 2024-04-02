import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { UserType } from '#modules/users';
import { AnswerType } from './answer.js';

type AnswersOfUser = {
  user: typeof UserType.$inferType;
  answers: Array<typeof AnswerType.$inferType>;
  date: Date;
};

export const AnswersOfUserType = builder.objectRef<AnswersOfUser>('AnswersOfUser').implement({
  description:
    "Représente toutes les réponses d'un·e utilisateur·ice à un formulaire. Pratique pour grouper les réponses afin de les afficher dans un tableau",
  fields: (t) => ({
    user: t.field({ type: UserType, resolve: (parent) => parent.user }),
    answers: t.field({
      type: [AnswerType],
      resolve: (parent) => parent.answers,
    }),
    date: t.expose('date', {
      description: 'Correspond à la date de dernière réponse parmis les réponses',
      type: DateTimeScalar,
    }),
  }),
});
