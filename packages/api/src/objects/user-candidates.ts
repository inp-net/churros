import { hash } from 'argon2';
import { ZodError } from 'zod';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { completeRegistration, register } from '../services/registration.js';
import { DateTimeScalar } from './scalars.js';

/** Represents a user, mapped on the underlying database object. */
export const UserCandidateType = builder.prismaNode('UserCandidate', {
  id: { field: 'id' },
  fields: (t) => ({
    majorId: t.exposeID('majorId', { nullable: true }),
    email: t.exposeString('email'),
    emailValidated: t.exposeBoolean('emailValidated'),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar, nullable: true }),
    graduationYear: t.exposeInt('graduationYear', { nullable: true }),

    // School details
    schoolServer: t.exposeString('schoolServer', { nullable: true }),
    schoolUid: t.exposeString('schoolUid', { nullable: true }),
    schoolEmail: t.exposeString('schoolEmail', { nullable: true }),

    // Profile details
    address: t.exposeString('address'),
    biography: t.exposeString('biography'),
    birthday: t.expose('birthday', {
      type: DateTimeScalar,
      nullable: true,
    }),
    nickname: t.exposeString('nickname'),
    phone: t.exposeString('phone'),
    pictureFile: t.exposeString('pictureFile'),
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
    cursor: 'id',
    resolve: async (query) => prisma.userCandidate.findMany({ ...query }),
  })
);

/** Registers a new user. */
builder.mutationField('startRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: { types: [ZodError] },
    args: {
      email: t.arg.string({ validate: { minLength: 1, maxLength: 255, email: true } }),
    },
    async resolve(_, { email }) {
      await register(email);
      return true;
    },
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
