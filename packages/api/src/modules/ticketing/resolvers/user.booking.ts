import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { fullName, UserType } from '#modules/users';
import { GraphQLError } from 'graphql';
import { authorIsBeneficiary, RegistrationType } from '../index.js';

builder.prismaObjectField(UserType, 'booking', (t) =>
  t.prismaField({
    type: RegistrationType,
    nullable: true,
    args: {
      event: t.arg({ type: LocalID }),
      // TODO: split into 2 arguments
      beneficiary: t.arg.string({
        required: false,
        description:
          'Identifiant complet (avec le préfixe) pour un bénéficiaire avec compte Churros, ou texte libre pour un bénéficiaire externe',
      }),
    },
    async resolve(query, user, { event: eventId, beneficiary: argBeneficiary }) {
      if (!user) throw new GraphQLError('User not found');
      eventId = ensureGlobalId(eventId, 'Event');
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

      return registration;
    },
  }),
);
