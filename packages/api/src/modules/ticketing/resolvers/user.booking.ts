import { builder, prisma } from '#lib';
import { fullName, UserType } from '#modules/users';
import { GraphQLError } from 'graphql';
import { authorIsBeneficiary, RegistrationType } from '../index.js';

builder.prismaObjectField(UserType, 'booking', (t) =>
  t.prismaField({
    type: RegistrationType,
    args: {
      event: t.arg.id(),
      // TODO: split into 2 arguments
      beneficiary: t.arg.string({
        required: false,
        description:
          'Identifiant complet (avec le préfixe) pour un bénéficiaire avec compte Churros, ou texte libre pour un bénéficiaire externe',
      }),
    },
    async resolve(query, _, { event: eventId, beneficiary: argBeneficiary }, { user }) {
      if (!user) throw new GraphQLError('User not found');
      const registrations = await prisma.registration.findMany({
        include: {
          ...query.include,
          author: query.include && 'author' in query.include ? query.include.author : true,
        },
        where: { ticket: { eventId } },
      });

      const registration = registrations.find(
        ({ author, externalBeneficiary, internalBeneficiaryId, authorEmail }) =>
          (author?.uid === user.uid || authorEmail === user.email) &&
          ((author
            ? authorIsBeneficiary(
                { ...author, fullName: fullName(author) },
                externalBeneficiary,
                internalBeneficiaryId,
                authorEmail,
              )
            : false) ||
            externalBeneficiary === argBeneficiary ||
            internalBeneficiaryId === argBeneficiary),
      );

      if (!registration) throw new GraphQLError('Registration not found');
      return registration;
    },
  }),
);
