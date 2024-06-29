import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { createUid, fullName, isSchoolEmail, needsManualValidation } from '../index.js';

/** Represents a user, mapped on the underlying database object. */
export const UserCandidateType = builder.prismaNode('UserCandidate', {
  id: { field: 'id' },
  include: {
    major: { include: { schools: true } },
    usingQuickSignup: { include: { school: { include: { majors: true } } } },
  },
  fields: (t) => ({
    majorId: t.exposeID('majorId', { nullable: true }),
    email: t.exposeString('email'),
    emailValidated: t.exposeBoolean('emailValidated'),
    emailIsSchoolEmail: t.boolean({
      description: "Vrai si l'email est une adresse email d'étudiant.",
      async resolve({ email }) {
        return isSchoolEmail(email, await prisma.school.findMany());
      },
    }),
    needsManualValidation: t.boolean({
      description:
        "Vrai si l'utilisateur aura besoin d'une validation manuelle à la fin de l'inscription. Null si la notion n'a pas encore de sens. Si la filière n'a pas encore été renseignée, retourne vrai seulement si l'inscription devra être validée manuellement si une filière (peut importe laquelle) est choisie. Voir `needsManualValidationForMajor` pour être plus précis",
      nullable: true,
      async resolve(parent) {
        try {
          if (parent.major) return needsManualValidation(parent);
          const majors = await prisma.major.findMany({ include: { schools: true } });
          return majors.every((major) => needsManualValidation({ ...parent, major }));
        } catch {
          return null;
        }
      },
    }),
    needsManualValidationForMajor: t.boolean({
      description:
        "Vrai si l'utilisateur aura besoin d'une validation manuelle à la fin de l'inscription si iel choisi cette filière. Null si la notion n'a pas encore de sens.",
      args: {
        major: t.arg.string({ description: "L'UID de la filière" }),
      },
      nullable: true,
      async resolve(parent, { major }) {
        try {
          return needsManualValidation({
            ...parent,
            major: await prisma.major.findUniqueOrThrow({
              where: { uid: major },
              include: { schools: true },
            }),
          });
        } catch {
          return null;
        }
      },
    }),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    fullName: t.field({
      type: 'String',
      resolve(user) {
        return fullName(user);
      },
    }),
    uid: t.exposeString('uid'),
    suggestedUid: t.string({
      resolve: createUid,
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar, nullable: true }),
    graduationYear: t.int({
      resolve: ({ graduationYear }) => graduationYear ?? new Date().getFullYear() + 3,
    }),

    // School details
    schoolServer: t.exposeString('schoolServer', { nullable: true }),
    schoolUid: t.exposeString('schoolUid', { nullable: true }),
    schoolEmail: t.exposeString('schoolEmail', { nullable: true }),

    // Profile details
    address: t.exposeString('address'),
    birthday: t.expose('birthday', {
      type: DateTimeScalar,
      nullable: true,
    }),
    phone: t.exposeString('phone'),
    cededImageRightsToTVn7: t.exposeBoolean('cededImageRightsToTVn7'),
    apprentice: t.exposeBoolean('apprentice'),
    usingQuickSignup: t.boolean({
      description: "Vrai si l'utilisateur a été créé via un lien d'inscription rapide.",
      resolve: ({ quickSignupId }) => Boolean(quickSignupId),
    }),

    major: t.relation('major', { nullable: true }),
  }),
});
