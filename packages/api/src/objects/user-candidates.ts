import { hash } from 'argon2';
import { ZodError } from 'zod';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
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

    major: t.relation('major'),
  }),
});

builder.queryField('userCandidate', (t) =>
  t.prismaField({
    type: UserCandidateType,
    args: { token: t.arg.string() },
    resolve: (query, _, { token }) =>
      prisma.userCandidate.findUniqueOrThrow({ ...query, where: { token } }),
  })
);

builder.queryField('userCandidates', (t) =>
  t.prismaConnection({
    type: UserCandidateType,
    authScopes: { canEditUsers: true },
    cursor: 'id',
    resolve: async (query) =>
      prisma.userCandidate.findMany({ ...query, where: { emailValidated: true } }),
  })
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
  })
);

builder.mutationField('completeRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: { types: [ZodError] },
    args: {
      token: t.arg.string(),
      firstName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      majorId: t.arg.id(),
      graduationYear: t.arg.int({ validate: { min: 1900, max: 2100 } }),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      password: t.arg.string({ validate: { minLength: 8, maxLength: 255 } }),
      passwordConfirmation: t.arg.string({ validate: {} }),
    },
    validate: [
      ({ password, passwordConfirmation }) => password === passwordConfirmation,
      { path: ['passwordConfirmation'], message: 'Les mots de passe ne correspondent pas.' },
    ],
    resolve: async (
      _,
      { token, firstName, lastName, majorId, graduationYear, address, birthday, phone, password }
    ) =>
      completeRegistration(
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
          },
        })
      ),
  })
);

builder.queryField('userCandidateByEmail', (t) =>
  t.prismaField({
    type: UserCandidateType,
    authScopes: { canEditUsers: true },
    args: { email: t.arg.string() },
    resolve: (query, _, { email }) =>
      prisma.userCandidate.findUniqueOrThrow({ ...query, where: { email } }),
  })
);

builder.mutationField('acceptRegistration', (t) =>
  t.field({
    authScopes: { canEditUsers: true },
    type: 'Boolean',
    args: { email: t.arg.string() },
    resolve: async (_, { email }) =>
      saveUser(await prisma.userCandidate.findUniqueOrThrow({ where: { email } })),
  })
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
    },
    async resolve(
      _,
      { register, email, firstName, lastName, majorId, graduationYear, address, birthday, phone }
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
        },
      });
      if (register) await saveUser(candidate);
      return true;
    },
  })
);

builder.mutationField('refuseRegistration', (t) =>
  t.field({
    authScopes: { canEditUsers: true },
    type: 'Boolean',
    args: { email: t.arg.string() },
    async resolve(_, { email }) {
      await prisma.userCandidate.delete({ where: { email } });
      return true;
    },
  })
);
