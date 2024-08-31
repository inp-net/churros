import { builder, freeUidValidator, prisma, schoolYearStart } from '#lib';
import { DateTimeScalar, UIDScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { saveUser } from '../index.js';

builder.mutationField('updateUserCandidate', (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { admin: true, studentAssociationAdmin: true },
    errors: { types: [ZodError] },
    args: {
      register: t.arg.boolean({
        description:
          "Inscrire définitivement l'utilisateur·ice si vrai. Si faux, mettre à jour la demande d'inscription sans créer de compte",
      }),
      email: t.arg.string(),
      uid: t.arg({
        type: UIDScalar,
        validate: freeUidValidator,
        description: 'Le @ souhaité',
      }),
      firstName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      majorId: t.arg.id(),
      graduationYear: t.arg.int({ validate: { min: 1900, max: 2100 } }),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      cededImageRightsToTVn7: t.arg.boolean(),
    },
    async resolve(
      _,
      {
        register,
        email,
        firstName,
        lastName,
        majorId,
        uid,
        graduationYear,
        birthday,
        cededImageRightsToTVn7,
      },
    ) {
      const major = await prisma.major.findUnique({
        where: { id: majorId },
      });
      if (graduationYear >= schoolYearStart().getFullYear() && major?.discontinued) {
        throw new GraphQLError(
          "Cette filière n'existe plus, il n'est pas possible de s'y délarer comme étudiant·e (sauf avec une ancienne promo).",
        );
      }
      const candidate = await prisma.userCandidate.update({
        where: { email },
        data: {
          birthday,
          uid,
          firstName,
          majorId,
          graduationYear,
          lastName,
          cededImageRightsToTVn7,
        },
      });
      if (register) await saveUser(candidate);
      return true;
    },
  }),
);
