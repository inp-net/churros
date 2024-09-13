import { builder, ensureGlobalId, log, prisma, sendMail } from '#lib';
import { Email, UIDScalar, URLScalar } from '#modules/global';
import { UserCandidateType } from '#modules/users/types';
import { createUid, hashPassword } from '#modules/users/utils';
import { Prisma } from '@churros/db/prisma';
import { hashPassword as ldapHashPassword } from '@inp-net/ldap7/user';
import { GraphQLError } from 'graphql';
import omit from 'lodash.omit';
import { nanoid } from 'nanoid';
import { ZodError } from 'zod';

/** Registers a new user. */
builder.mutationField('startSignup', (t) =>
  t.prismaField({
    type: UserCandidateType,
    errors: { types: [ZodError, Error] },
    args: {
      email: t.arg({
        type: Email,
        validate: {
          refine: [
            async (email) => !(await prisma.user.findUnique({ where: { email } })),
            { message: 'Ce compte existe déjà.' },
          ],
        },
      }),
      quickSignupCode: t.arg.string({
        required: false,
        description:
          "Code d'inscription rapide, pour s'inscrire sans mail étudiant et sans validation manuelle. Voir QuickSignupType.",
      }),
      major: t.arg({
        required: false,
        type: UIDScalar,
        description: 'Filière à laquelle la personne se déclare étudiant.e',
      }),
      firstName: t.arg.string({
        description: 'Prénom',
        validate: { minLength: 1 },
      }),
      lastName: t.arg.string({
        description: 'Nom de famille',
        validate: { minLength: 1 },
      }),
      graduationYear: t.arg.int({
        description: 'Promo de la personne',
      }),
      password: t.arg.string({
        description: 'Mot de passe',
        validate: { minLength: 8 },
      }),
      passwordConfirmation: t.arg.string({
        description: 'Confirmation du mot de passe',
      }),
      mailVerificationCallbackURL: t.arg({
        type: URLScalar,
        description:
          "Template d'URL à utliser pour le lien de validation d'adresse e-mail envoyé. [token] est remplacé par le token de validation dans l'URL donnée. La page à cette URL doit appeler Mutation.finishSignup.",
      }),
    },
    validate: [
      [
        ({ password, passwordConfirmation }) => password === passwordConfirmation,
        { path: ['passwordConfirmation'], message: 'Les mots de passe ne correspondent pas.' },
      ],
      [
        ({ major, quickSignupCode }) => (quickSignupCode ? Boolean(major) : true),
        { path: ['major'], message: 'Il faut choisir une filière' },
      ],
    ],
    async resolve(
      query,
      _,
      { quickSignupCode, mailVerificationCallbackURL, major: majorUid, ...args },
      { user },
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // TODO maybe hold UID while we process the signup so that no one else can take it while someone else is signing up?
      if (
        !user?.admin &&
        !user?.adminOfStudentAssociations.length &&
        process.env.PUBLIC_DEACTIVATE_SIGNUPS === 'true' &&
        !quickSignupCode
      ) {
        throw new GraphQLError(
          process.env.PUBLIC_DEACTIVATE_SIGNUPS_MESSAGE || 'Les inscriptions sont désactivées.',
        );
      }

      const quickSignup = quickSignupCode
        ? await prisma.quickSignup.findUnique({
            where: {
              id: ensureGlobalId(quickSignupCode.toLowerCase(), 'QuickSignup'),
            },
            include: { school: true },
          })
        : undefined;

      const major = majorUid
        ? await prisma.major.findUniqueOrThrow({
            where: { uid: majorUid },
            include: { schools: true },
          })
        : undefined;

      if (quickSignup) {
        if (!major) throw new GraphQLError("Choisis une filière pour t'inscrire via ce QR Code");

        if (!major.schools.some((s) => s.id === quickSignup.schoolId)) {
          throw new GraphQLError(
            `Ce QR Code ne te permet pas de t'inscrire dans une filière en dehors de ${quickSignup.school.name}`,
          );
        }
      }

      const uid = await createUid({ firstName: args.firstName, lastName: args.lastName });

      await log(
        'signups',
        'start',
        { uid, args, quickSignupCode, quickSignup, major, mailVerificationCallbackURL },
        args.email,
        user,
      );

      const candidate = await prisma.userCandidate
        .create({
          ...query,
          data: {
            uid,
            token: nanoid(),
            usingQuickSignup: quickSignup
              ? {
                  connect: { id: quickSignup.id },
                }
              : undefined,
            major: major ? { connect: { id: major.id } } : undefined,
            churrosPassword: await hashPassword(args.password),
            ldapPassword: ldapHashPassword(args.password),
            ...omit(args, 'password', 'passwordConfirmation'),
          },
        })
        .catch((error) => {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new GraphQLError(
              "Ooops! Il semblerait qu'entre-temps, quelqu'un d'autre se soit inscrit.e avec cette email ou ce pseudo :/",
            );
          }
          throw error;
        });

      await sendMail(
        'signup-verify-mail',
        args.email,
        {
          username: uid,
          url: mailVerificationCallbackURL.toString().replaceAll('[token]', candidate.token),
        },
        {},
      );

      return candidate;
    },
  }),
);
