import { builder, prisma } from '#lib';

import { fullName } from '#modules/users';
import { GraphQLError } from 'graphql';
import { RegistrationType, authorIsBeneficiary } from '../index.js';
// TODO rename to user.booking
builder.queryField('registrationOfUser', (t) =>
  t.prismaField({
    type: RegistrationType,
    args: {
      eventUid: t.arg.string(),
      beneficiary: t.arg.string({ required: false }),
    },
    async resolve(query, _, { eventUid, beneficiary: argBeneficiary }, { user }) {
      if (!user) throw new GraphQLError('User not found');
      const registrations = await prisma.registration.findMany({
        include: {
          ...query.include,
          author: query.include && 'author' in query.include ? query.include.author : true,
        },
        where: { ticket: { event: { uid: eventUid } } },
      });

      const registration = registrations.find(
        ({ author, beneficiary, authorEmail }) =>
          (author?.uid === user.uid || authorEmail === user.email) &&
          ((author
            ? authorIsBeneficiary(
                { ...author, fullName: fullName(author) },
                beneficiary,
                authorEmail,
              )
            : false) ||
            beneficiary === argBeneficiary),
      );

      if (!registration) throw new GraphQLError('Registration not found');
      return registration;
    },
  }),
);
