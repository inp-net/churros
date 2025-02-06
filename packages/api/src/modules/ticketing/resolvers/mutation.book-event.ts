import { builder, ensureGlobalId, fullName, localID, log, prisma, sendMail } from '#lib';
import { Email, LocalID, UIDScalar } from '#modules/global';
import { actualPrice } from '#modules/payments';
import { canBookTicket } from '#modules/ticketing';
import { RegistrationType } from '#modules/ticketing/types';
import { GraphQLError } from 'graphql';
import * as qrcode from 'qrcode';
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
      authorName: t.arg.string({
        required: false,
        description:
          "Nom de la personne réservant la place, pratique quand on réserve une place sans compte Churros. L'email peut ne pas être très parlante pour savoir qui a réservé",
      }),
      authorEmail: t.arg({
        required: false,
        type: Email,
        description:
          'Adresse mail à laquelle envoyer le billet. Nécéssaire quand on est pas connecté.e',
      }),
      pointOfContact: t.arg({
        required: false,
        type: UIDScalar,
        description:
          "Personne référente à contacter s'il y a un problème de comportement avec la personne ayant réservé. Surtout pratique pour les réservations faites par des extés (sans compte Churros). Il est obligatoire de le renseigner si l'on réserve sans compte Churros et que Event.enforcePointOfContact est true.",
      }),
      bookingUrl: t.arg.string({
        description: "URL vers la page du billet. '[code]' est remplacé par le code de réservation",
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

      const pointOfContact = args.pointOfContact
        ? await prisma.user.findUnique({
            where: { uid: args.pointOfContact },
          })
        : null;

      const [can, whynot] = canBookTicket({
        user,
        userAdditionalData,
        beneficiary: args.churrosBeneficiary
          ? await prisma.user.findUniqueOrThrow({
              where: { uid: args.churrosBeneficiary },
            })
          : args.beneficiary,
        ticket,
        pointOfContact,
        debug: true,
      });

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

      const booking = await prisma.registration.create({
        ...query,
        data: {
          ticket: { connect: { id } },
          author: user ? { connect: { id: user.id } } : undefined,
          authorEmail: args.authorEmail ?? undefined,
          authorName: args.authorName ?? undefined,
          paid:
            actualPrice(user, ticket, null) === 0 && ticket.maximumPrice === ticket.minimumPrice,
          externalBeneficiary: args.beneficiary,
          internalBeneficiary: args.churrosBeneficiary
            ? { connect: { uid: args.churrosBeneficiary } }
            : undefined,
          pointOfContact: args.pointOfContact
            ? { connect: { uid: args.pointOfContact } }
            : undefined,
        },
      });

      const {
        ticket: { event },
        internalBeneficiary,
        pointOfContact,
      } = await prisma.registration.findUniqueOrThrow({
        where: { id: booking.id },
        select: {
          ticket: { select: { event: true } },
          internalBeneficiary: true,
          pointOfContact: true,
        },
      });

      const mailRecipients = [];
      if (user) mailRecipients.push(user.email);
      if (booking.authorEmail) mailRecipients.push(booking.authorEmail);
      if (internalBeneficiary) mailRecipients.push(internalBeneficiary.email);

      const bookingCode = localID(booking.id).toUpperCase();
      await sendMail(
        'booking',
        mailRecipients,
        {
          bookingCode,
          beneficiary: internalBeneficiary
            ? fullName(internalBeneficiary)
            : booking.externalBeneficiary,
          bookingLink: args.bookingUrl.replace('[code]', bookingCode),
          eventTitle: event.title,
          pointOfContact: pointOfContact ? fullName(pointOfContact) : null,
        },
        {
          attachments: {
            qrcode: {
              filename: `qrcode-${bookingCode}.png`,
              content: await qrcode.toBuffer(args.bookingUrl.replace('[code]', bookingCode), {
                errorCorrectionLevel: 'H',
              }),
            },
          },
        },
      );

      return booking;
    },
  }),
);
