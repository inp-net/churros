import { builder, splitID } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const QuickSignupType = builder.prismaObject('QuickSignup', {
  description:
    "Lien d'inscription rapide, qui permet de créer un compte étudiant sans adresse mail étudiante et sans validation manuelle",
  fields: (t) => ({
    id: t.exposeID('id'),
    code: t.string({
      resolve: ({ id }) => splitID(id)[1],
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    validUntil: t.expose('validUntil', { type: DateTimeScalar }),
    school: t.relation('school'),
    schoolId: t.exposeID('schoolId'),
  }),
});
