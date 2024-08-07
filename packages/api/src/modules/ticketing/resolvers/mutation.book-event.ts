import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
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
      authorEmail: t.arg.string({
        description:
          "Email de la personne effectuant la réservation, requis quand l'utilisateur·ice n'est pas connecté·e: c'est alors le seul moyen qu'on a d'envoyer le billet.",
      }),
      beneficiary: t.arg.string({
        description: 'Nom du bénéficiaire du billet',
        required: false,
      }),
    },
    async authScopes(_, { ticket: ticketId, beneficiary }, { user }) {
      const userAdditionalData = user
        ? await prisma.user.findUnique({
            where: { id: user.id },
            include: canBookTicket.userPrismaIncludes,
          })
        : null;
      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: { id: ensureGlobalId(ticketId, 'Ticket') },
        include: canBookTicket.prismaIncludes,
      });

      const [can, whynot] = canBookTicket(user, userAdditionalData, beneficiary, ticket);

      if (!can && whynot) {
        await log(
          'ticketing',
          'book/failed',
          { why: whynot, ticket: ticketId, beneficiary },
          ticketId,
          user,
        );
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
          authorEmail: args.authorEmail,
          beneficiary: args.beneficiary ?? '',
          paid: actualPrice(user, ticket) === 0,
        },
      });
    },
  }),
);
