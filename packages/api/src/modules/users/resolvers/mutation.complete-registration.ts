import { builder, createLdapUser, prisma, yearTier } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { NotificationChannel, type Major, type UserCandidate } from '@prisma/client';
import { hash } from 'argon2';
import { ZodError } from 'zod';
import { notify } from '../../notifications/utils/send.js';
import { completeRegistration } from '../index.js';
// TODO rename registration to signup

builder.mutationField('completeRegistration', (t) =>
  t.fieldWithInput({
    type: 'Boolean',
    errors: { types: [ZodError] },
    input: {
      token: t.input.string(),
      firstName: t.input.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastName: t.input.string({ validate: { minLength: 1, maxLength: 255 } }),
      majorId: t.input.id({ required: false }),
      graduationYear: t.input.int({
        validate: { min: 1900, max: new Date().getFullYear() + 100 },
        required: false,
      }),
      birthday: t.input.field({ type: DateTimeScalar, required: false }),
      phone: t.input.string({ validate: { maxLength: 255 } }),
      address: t.input.string({ validate: { maxLength: 255 } }),
      password: t.input.string({ validate: { minLength: 8, maxLength: 255 } }),
      passwordConfirmation: t.input.string({ validate: {} }),
      cededImageRightsToTVn7: t.input.boolean(),
      apprentice: t.input.boolean(),
    },
    validate: [
      [
        ({ input: { password, passwordConfirmation } }) => password === passwordConfirmation,
        {
          path: ['passwordConfirmation'],
          message: 'Les mots de passe ne correspondent pas.',
        },
      ],
      [
        ({ input: { majorId, graduationYear } }) => !majorId || graduationYear,
        {
          path: ['graduationYear'],
          message: 'Vous devez préciser votre promo si vous êtes un·e étudiant·e.',
        },
      ],
    ],
    async resolve(
      _,
      {
        input: {
          token,
          firstName,
          lastName,
          majorId,
          graduationYear,
          address,
          birthday,
          phone,
          password,
          cededImageRightsToTVn7,
          apprentice,
        },
      },
    ) {
      // TODO make graduationYear non required in prisma
      graduationYear ??= new Date().getFullYear() + 4;

      await prisma.logEntry.create({
        data: {
          action: 'complete',
          area: 'signups',

          message: `Complétion de l'inscription de ${firstName} ${lastName} ${yearTier(
            graduationYear,
          ).toString()}A ${phone}`,

          target: `token ${token}`,
        },
      });
      const user = await completeRegistration(
        await prisma.userCandidate.update({
          where: { token },
          data: {
            emailValidated: true,
            address,
            birthday,
            firstName,
            majorId,
            graduationYear,
            lastName,
            phone,
            password: await hash(password),
            cededImageRightsToTVn7,
            apprentice,
          },
          include: { major: true },
        }),
      );
      const userOrCandidate: (typeof user | UserCandidate) & { major?: Major | undefined | null } =
        user ??
        (await prisma.userCandidate.findUniqueOrThrow({
          where: { token },
          include: { major: true },
        }));

      const needsVerification = !user;

      await notify(await prisma.user.findMany({ where: { admin: true } }), {
        title: needsVerification ? `Inscription en attente de validation` : `Nouvelle inscription!`,
        body:
          `${userOrCandidate.email} (${userOrCandidate.firstName} ${userOrCandidate.lastName}, ${
            userOrCandidate.graduationYear ? yearTier(userOrCandidate.graduationYear) : '?'
          }A ${userOrCandidate.major?.shortName ?? 'sans filière'}) ` +
          (needsVerification ? `a fait une demande d'inscription` : `s'est inscrit·e!`),
        data: {
          channel: NotificationChannel.Other,
          goto: needsVerification ? '/signups' : `/user/${user.uid}`,
          group: undefined,
        },
      });

      if (user?.major && user.major.ldapSchool) {
        try {
          await createLdapUser({ ...user, otherEmails: [] }, password);
        } catch (error) {
          console.error(error);
        }
      }

      return user !== undefined;
    },
  }),
);
