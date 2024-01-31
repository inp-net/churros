import { builder, createLdapUser, prisma, yearTier } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { NotificationChannel, type Major, type UserCandidate } from '@prisma/client';
import { hash } from 'argon2';
import { ZodError } from 'zod';
import { notify } from '../../notifications/utils/send.js';
import { completeRegistration } from '../index.js';
// TODO rename registration to signup

builder.mutationField('completeRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: { types: [ZodError] },
    args: {
      token: t.arg.string(),
      firstName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      majorId: t.arg.id({ required: false }),
      graduationYear: t.arg.int({ validate: { min: 1900, max: 2100 } }),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      password: t.arg.string({ validate: { minLength: 8, maxLength: 255 } }),
      passwordConfirmation: t.arg.string({ validate: {} }),
      cededImageRightsToTVn7: t.arg.boolean(),
      apprentice: t.arg.boolean(),
    },
    validate: [
      ({ password, passwordConfirmation }) => password === passwordConfirmation,
      { path: ['passwordConfirmation'], message: 'Les mots de passe ne correspondent pas.' },
    ],
    async resolve(
      _,
      {
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
    ) {
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
