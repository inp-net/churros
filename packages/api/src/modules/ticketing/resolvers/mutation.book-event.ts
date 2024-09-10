import { builder, ensureGlobalId, log, prisma } from '#lib';
import { Email, LocalID, UIDScalar } from '#modules/global';
import { actualPrice } from '#modules/payments';
import { canBookTicket } from '#modules/ticketing';
import { RegistrationType } from '#modules/ticketing/types';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('bookEvent', (t) =>
  t.prismaField({
    type: RegistrationType,
    description: 'Réserver une place sur un évènement',
    errors: { types: [Error, ZodError] },
    args: {
      ticket: t.arg({
        type: LocalID,
      }),
      churrosBeneficiary: t.arg({
        required: false,
        type: UIDScalar,
        description: 'Identifiant (@) de la personne qui recevra la place',
      }),
      beneficiary: t.arg.string({
        required: false,
        description:
          "Nom de la personne pour qui on réserve la place. Préférer churrosBeneficiary quand c'est possible",
      }),
      authorEmail: t.arg({
        required: false,
        type: Email,
        description:
          'Adresse mail à laquelle envoyer le billet. Nécéssaire quand on est pas connecté.e',
      }),
    },
    validate: [
      [
        ({ beneficiary, churrosBeneficiary }) => !(beneficiary && churrosBeneficiary),
        { message: 'Il faut choisir entre un bénéficiaire interne et externe' },
      ],
    ],
    async authScopes(_, args, { user }) {
      const userAdditionalData = user
        ? await prisma.user.findUnique({
            where: { id: user.id },
            include: canBookTicket.userPrismaIncludes,
          })
        : null;
      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: { id: ensureGlobalId(args.ticket, 'Ticket') },
        include: canBookTicket.prismaIncludes,
      });

      const [can, whynot] = canBookTicket(
        user,
        userAdditionalData,
        args.churrosBeneficiary
          ? await prisma.user.findUniqueOrThrow({
              where: { uid: args.churrosBeneficiary },
            })
          : args.beneficiary,
        ticket,
        true,
      );

      if (!can && whynot) {
        await log('ticketing', 'book/failed', { why: whynot, ...args }, ticket.id, user);
        throw new GraphQLError(whynot);
      }

      return can;
    },
    async resolve(query, _, args, { user }) {
      if (!user && !args.authorEmail) {
        throw new GraphQLError(
          'Vous devez vous connecter ou fournir un email pour réserver un billet.',
        );
      }

      const id = ensureGlobalId(args.ticket, 'Ticket');
      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: { id },
        include: actualPrice.prismaIncludes,
      });

      await log('ticketing', 'book', { ...args, ticket }, id, user);

      return prisma.registration.create({
        ...query,
        data: {
          ticket: { connect: { id } },
          author: user ? { connect: { id: user.id } } : undefined,
          authorEmail: args.authorEmail ?? undefined,
          paid:
            actualPrice(user, ticket, null) === 0 && ticket.maximumPrice === ticket.minimumPrice,
          internalBeneficiary: args.churrosBeneficiary
            ? { connect: { uid: args.churrosBeneficiary } }
            : undefined,
          externalBeneficiary: args.beneficiary,
        },
      });
    },
  }),
);
