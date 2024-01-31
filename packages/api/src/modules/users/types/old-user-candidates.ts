import { NotificationChannel, type Major, type UserCandidate } from '@prisma/client';
import { hash } from 'argon2';
import { createTransport } from 'nodemailer';
import { ZodError } from 'zod';
import { yearTier } from '../date.js';
import { builder, prisma } from '../lib/index.js';
import { createLdapUser } from '../services/ldap.js';
import { notify } from '../services/notifications.js';
import { completeRegistration, register, saveUser } from '../services/registration.js';
import { DateTimeScalar } from './scalars.js';
import { fullName } from './users.js';

/** Represents a user, mapped on the underlying database object. */
export const UserCandidateType = builder.prismaNode('UserCandidate', {
  id: { field: 'id' },
  fields: (t) => ({
    majorId: t.exposeID('majorId', { nullable: true }),
    email: t.exposeString('email'),
    emailValidated: t.exposeBoolean('emailValidated'),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    fullName: t.field({
      type: 'String',
      resolve(user) {
        return fullName(user);
      },
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar, nullable: true }),
    graduationYear: t.exposeInt('graduationYear', { nullable: true }),

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

    major: t.relation('major', { nullable: true }),
  }),
});

builder.queryField('userCandidate', (t) =>
  t.prismaField({
    type: UserCandidateType,
    args: { token: t.arg.string() },
    resolve: async (query, _, { token }) =>
      prisma.userCandidate.findUniqueOrThrow({ ...query, where: { token } }),
  }),
);

builder.queryField('userCandidates', (t) =>
  t.prismaConnection({
    type: UserCandidateType,
    authScopes: { canEditUsers: true },
    cursor: 'id',
    resolve: async (query) =>
      prisma.userCandidate.findMany({ ...query, where: { emailValidated: true } }),
  }),
);

/** Registers a new user. */
builder.mutationField('startRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: { types: [ZodError] },
    args: {
      email: t.arg.string({
        validate: {
          minLength: 1,
          maxLength: 255,
          email: true,
          refine: [
            async (email) => !(await prisma.user.findUnique({ where: { email } })),
            { message: 'Ce compte existe déjà.' },
          ],
        },
      }),
    },
    resolve: async (_, { email }) => register(email),
  }),
);

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

builder.queryField('userCandidateByEmail', (t) =>
  t.prismaField({
    type: UserCandidateType,
    authScopes: { canEditUsers: true },
    args: { email: t.arg.string() },
    resolve: async (query, _, { email }) =>
      prisma.userCandidate.findUniqueOrThrow({ ...query, where: { email } }),
  }),
);

builder.mutationField('acceptRegistration', (t) =>
  t.field({
    authScopes: { canEditUsers: true },
    type: 'Boolean',
    args: { email: t.arg.string() },
    async resolve(_, { email }, { user }) {
      const candidate = await prisma.userCandidate.findUniqueOrThrow({ where: { email } });
      await prisma.logEntry.create({
        data: {
          action: 'accept',
          area: 'signups',
          message: `Acceptation de l'inscription de ${email}`,
          user: { connect: { id: user!.id } },
          target: `token ${candidate.token}`,
        },
      });
      await saveUser(candidate);
      return true;
    },
  }),
);

builder.mutationField('updateUserCandidate', (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { canEditUsers: true },
    errors: { types: [ZodError] },
    args: {
      register: t.arg.boolean(),
      email: t.arg.string(),
      firstName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      majorId: t.arg.id(),
      graduationYear: t.arg.int({ validate: { min: 1900, max: 2100 } }),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
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
        graduationYear,
        address,
        birthday,
        phone,
        cededImageRightsToTVn7,
      },
    ) {
      const candidate = await prisma.userCandidate.update({
        where: { email },
        data: {
          address,
          birthday,
          firstName,
          majorId,
          graduationYear,
          lastName,
          phone,
          cededImageRightsToTVn7,
        },
      });
      if (register) await saveUser(candidate);
      return true;
    },
  }),
);

builder.mutationField('refuseRegistration', (t) =>
  t.field({
    authScopes: { canEditUsers: true },
    type: 'Boolean',
    args: { email: t.arg.string(), reason: t.arg.string() },
    async resolve(_, { email, reason }, { user }) {
      const mailer = createTransport(process.env.SMTP_URL);
      await mailer.sendMail({
        to: email,
        from: process.env.PUBLIC_SUPPORT_EMAIL,
        subject: 'Inscription refusée',
        text: `Votre inscription a été refusée pour la raison suivante:\n\n ${reason}\n\n Si vous pensez qu'il s'agit d'une erreur, répondez à ce mail.`,
        html: `<p>Votre inscription a été refusée pour la raison suivante:<br><br> ${reason}<br><br> Si vous pensez qu'il s'agit d'une erreur, répondez à ce mail</p>`,
      });
      const candidate = await prisma.userCandidate.delete({ where: { email } });
      await prisma.logEntry.create({
        data: {
          action: 'refuse',
          area: 'signups',
          message: `Refus de l'inscription de ${email} pour ${reason}`,
          user: { connect: { id: user!.id } },
          target: `token ${candidate.token}`,
        },
      });
      return true;
    },
  }),
);
