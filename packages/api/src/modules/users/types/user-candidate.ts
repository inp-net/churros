import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { fullName } from '../index.js';

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
