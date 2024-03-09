import { builder, log, prisma } from '#lib';

import {
  PaymentMethodEnum,
  priceWithPromotionsApplied as actualPrice,
  payEventRegistrationViaLydia,
  payEventRegistrationViaPaypal,
} from '#modules/payments';
import { userCanAccessEvent, userCanManageEvent } from '#permissions';
import { PaymentMethod as PaymentMethodPrisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { placesLeft } from '../index.js';
// TODO rename to pay-booking.ts

builder.mutationField('paidRegistration', (t) =>
  t.field({
    description:
      'When paying with Paypal, returns the order id for a capture to finish the payment',
    type: 'String',
    errors: {},
    args: {
      regId: t.arg.id(),
      beneficiary: t.arg.string({ required: false }),
      paymentMethod: t.arg({ type: PaymentMethodEnum, required: false }),
      phone: t.arg.string({ required: false }),
    },
    async authScopes(_, { regId }, { user }) {
      const creating = !regId;
      const registration = await prisma.registration.findUnique({
        where: { id: regId },
        include: {
          ticket: {
            include: {
              event: {
                include: {
                  coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
                  group: { include: { studentAssociation: { include: { school: true } } } },
                  managers: { include: { user: true } },
                  tickets: true,
                },
              },
            },
          },
        },
      });
      if (!registration) throw new GraphQLError("La réservation associée n'existe pas");

      if (creating) {
        // Check that the user can access the event
        if (!(await userCanAccessEvent(registration.ticket.event, user)))
          throw new GraphQLError("Vous n'avez pas accès à cet événement");

        // Check for tickets that only managers can provide
        if (
          registration.ticket.onlyManagersCanProvide &&
          !userCanManageEvent(registration.ticket.event, user, { canVerifyRegistrations: true })
        )
          throw new GraphQLError('Seul un·e manager peut donner cette place');

        // Check that the ticket is still open
        if (registration.ticket.closesAt && registration.ticket.closesAt.valueOf() < Date.now())
          throw new GraphQLError("Le shotgun n'est plus ouvert");

        // Check that the ticket is not full
        const ticketAndRegistrations = await prisma.ticket.findUnique({
          where: { id: registration.ticket.id },
          include: {
            registrations: true,
            group: { include: { tickets: { include: { registrations: true } } } },
          },
        });
        if (placesLeft(ticketAndRegistrations!) <= 0)
          throw new GraphQLError("Il n'y a plus de places disponibles");
      }

      return true;
    },
    async resolve(_, { regId, beneficiary, paymentMethod, phone }, { user }) {
      const registration = await prisma.registration.findUnique({
        where: { id: regId },
        include: { ticket: { include: { event: true } } },
      });
      if (!registration) throw new GraphQLError('Registration not found');

      const ticket = await prisma.ticket.findUnique({
        where: { id: registration.ticket.id },
        include: { event: { include: { beneficiary: true } } },
      });
      if (!ticket) throw new GraphQLError('Ticket not found');
      if (!paymentMethod) throw new GraphQLError('Payment method not found');
      if (!phone && paymentMethod === PaymentMethodPrisma.Lydia)
        throw new GraphQLError('Phone not found');

      const price = await actualPrice(ticket, user);

      // Process payment
      const paypalOrderId = await pay({
        from: user?.uid ?? '(unregistered)',
        to: ticket.event.beneficiary?.id ?? '(unregistered)',
        amount: price,
        by: paymentMethod,
        phone: phone ?? '',
        emailAddress: user?.email ?? '',
        registrationId: registration.id,
      });

      await log(
        'registration',
        'update',
        { registration, paymentMethod, beneficiary },
        regId,
        user,
      );
      await prisma.registration.update({
        where: { id: regId },
        data: {
          paymentMethod,
          beneficiary: beneficiary ?? '',
        },
      });

      if (paymentMethod === PaymentMethodPrisma.PayPal) {
        if (!paypalOrderId)
          throw new GraphQLError("PayPal n'a pas donné d'identifiant de commande");
        return paypalOrderId!;
      }
      return '';
    },
  }),
);

async function pay({
  from,
  to,
  amount,
  by,
  phone,
  emailAddress,
  registrationId,
}: {
  from: string;
  to: string;
  amount: number;
  by: PaymentMethodPrisma;
  phone?: string;
  emailAddress?: string;
  registrationId?: string;
}): Promise<string | undefined> {
  switch (by) {
    case 'Lydia': {
      if (!phone) throw new GraphQLError('Missing phone number');
      await payEventRegistrationViaLydia(phone, registrationId);
      return;
    }

    case 'PayPal': {
      if (!registrationId) throw new GraphQLError('Pas de réservation associée');
      return payEventRegistrationViaPaypal(registrationId, emailAddress ?? '');
    }

    default: {
      return new Promise((_resolve, reject) => {
        reject(
          new GraphQLError(`Attempt to pay ${to} ${amount} from ${from} by ${by}: not implemented`),
        );
      });
    }
  }
}
