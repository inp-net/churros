import {
  builder,
  freeUidValidator,
  graphinx,
  nullToUndefined,
  prisma,
  schoolYearStart,
} from '#lib';
import { DateTimeScalar, Email, UIDScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import omit from 'lodash.omit';
import { ZodError } from 'zod';
import { saveUser, UserCandidateType } from '../index.js';

builder.mutationField('updateUserCandidate', (t) =>
  t.prismaField({
    type: UserCandidateType,
    authScopes: { admin: true, studentAssociationAdmin: true },
    errors: { types: [ZodError] },
    args: {
      register: t.arg.boolean({
        description:
          "Inscrire définitivement l'utilisateur·ice si vrai. Si faux, mettre à jour la demande d'inscription sans créer de compte",
      }),
      email: t.arg({
        type: Email,
        description:
          "Adresse email de l'inscription à modifier. On ne peut pas modifier l'adresse e-mail d'une inscription.",
      }),
      input: t.arg({
        type: builder.inputType('UserCandidateUpdateInput', {
          ...graphinx('users'),
          fields: (t) => ({
            uid: t.field({
              type: UIDScalar,
              validate: freeUidValidator,
              description: 'Le @ souhaité.',
              required: false,
            }),
            firstName: t.string({ required: false, validate: { minLength: 1, maxLength: 255 } }),
            lastName: t.string({ required: false, validate: { minLength: 1, maxLength: 255 } }),
            major: t.field({ type: UIDScalar, required: false, description: 'UID de la filière' }),
            graduationYear: t.int({ validate: { min: 1900, max: 2100 }, required: false }),
            birthday: t.field({ type: DateTimeScalar, required: false }),
            cededImageRightsToTVn7: t.boolean({ required: false }),
          }),
        }),
      }),
    },
    async resolve(query, _, { register, email, input }, { user }) {
      let candidate = await prisma.userCandidate.findUniqueOrThrow({
        where: { email },
      });
      const major =
        input.major || candidate.majorId
          ? await prisma.major.findFirst({
              where: input.major ? { uid: input.major } : { id: candidate.majorId! },
            })
          : null;
      if (
        input.graduationYear &&
        input.graduationYear >= schoolYearStart().getFullYear() &&
        major?.discontinued &&
        !(user?.admin || (user?.adminOfStudentAssociations?.length ?? 0) > 0)
      ) {
        throw new GraphQLError(
          "Cette filière n'existe plus, il n'est pas possible de s'y déclarer comme étudiant·e (sauf avec une ancienne promo).",
        );
      }
      candidate = await prisma.userCandidate.update({
        ...query,
        where: { email },
        data: {
          ...nullToUndefined(omit(input, 'major')),
          major: input.major ? { connect: { uid: input.major } } : undefined,
        },
      });
      if (register) await saveUser(candidate);
      return candidate;
    },
  }),
);
