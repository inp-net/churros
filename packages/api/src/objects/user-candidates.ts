import { ZodError } from 'zod';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { register } from '../services/register.js';
import { DateTimeScalar } from './scalars.js';

/** Represents a user, mapped on the underlying database object. */
export const UserCandidateType = builder.prismaObject('UserCandidate', {
  fields: (t) => ({
    id: t.exposeID('id'),
    majorId: t.exposeID('majorId', { nullable: true }),
    email: t.exposeString('email'),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar, nullable: true }),
    graduationYear: t.exposeInt('graduationYear', { nullable: true }),

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
    },
    async resolve(
      _,
      { token, firstName, lastName, majorId, graduationYear, address, birthday, phone }
    ) {
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
        },
      });
      return true;
    },
  })
);
