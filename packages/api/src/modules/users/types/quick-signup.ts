import { builder, localID } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { isPast } from 'date-fns';

export const QuickSignupType = builder.prismaNode('QuickSignup', {
  id: { field: 'id' },
  description:
    "Lien d'inscription rapide, qui permet de créer un compte étudiant sans adresse mail étudiante et sans validation manuelle",
  fields: (t) => ({
    code: t.string({
      resolve: ({ id }) => localID(id),
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    validUntil: t.expose('validUntil', { type: DateTimeScalar }),
    expired: t.boolean({
      description: 'Vrai si le lien est expiré',
      resolve: ({ validUntil }) => isPast(validUntil),
    }),
    school: t.relation('school'),
    schoolId: t.exposeID('schoolId'),
  }),
});
