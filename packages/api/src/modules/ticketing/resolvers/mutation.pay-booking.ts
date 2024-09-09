import { builder, ensureGlobalId, log, prisma, publish } from '#lib';
import {
  actualPrice,
  payEventRegistrationViaLydia,
  payEventRegistrationViaPaypal,
  PaymentMethodEnum,
} from '#modules/payments';
import { PaymentMethod as PaymentMethodPrisma } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { canEditBooking, RegistrationType } from '../index.js';

builder.mutationField('payBooking', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    args: {
      code: t.arg.string({ description: 'Code de réservation' }),
      paymentMethod: t.arg({ type: PaymentMethodEnum, required: false }),
      phone: t.arg.string({ required: false }),
      amount: t.arg.float({
        required: false,
        description:
          "Montant que l'on souhaite payer. Par défaut, le prix du billet. Peut être supérieur si l'on souhaite payer plus",
      }),
      paidCallback: t.arg.string({
        required: false,
        description:
          "URL ou chemin où renvoyer l'utilisateur.ice après confirmation du paiement. Sert par exemple pour l'URL de la notification de confirmation de paiement de la part de Lydia.",
      }),
    },
    async authScopes(_, { code }, { user }) {
      const booking = await prisma.registration.findUniqueOrThrow({
        where: { id: ensureGlobalId(code.toLowerCase(), 'Registration') },
        include: canEditBooking.prismaIncludes,
      });
      return canEditBooking(user, booking);
    },
    async resolve(query, _, { code, paymentMethod, phone, paidCallback, amount }, { user }) {
      const bookingId = ensureGlobalId(code.toLowerCase(), 'Registration');
      const registration = await prisma.registration.findUnique({
        where: { id: bookingId },
        include: { ticket: { include: actualPrice.prismaIncludes } },
      });
      if (!registration) throw new GraphQLError('Réservation introuvable');

      if (registration.paid) throw new GraphQLError('Tu as déjà payé cette réservation');

      const ticket = await prisma.ticket.findUnique({
        where: { id: registration.ticket.id },
        include: { event: { include: { beneficiary: true } } },
      });
      if (!ticket) throw new GraphQLError('Billet introuvable');
      if (!paymentMethod) throw new GraphQLError('Moyen de paiement non choisi');

      phone ||= user?.lydiaPhone;
      if (!phone && paymentMethod === PaymentMethodPrisma.Lydia)
        throw new GraphQLError('Numéro de téléphone manquant');

      const price = actualPrice(user, registration.ticket, amount ?? null);

      await prisma.registration.update({
        where: { id: bookingId },
        data: { wantsToPay: price },
      });

      // Process payment
      try {
        await pay({
          from: user?.uid ?? '(unregistered)',
          to: ticket.event.beneficiary?.id ?? '(unregistered)',
          amount: price,
          by: paymentMethod,
          phone: phone ?? '',
          emailAddress: user?.email ?? '',
          registrationId: registration.id,
          paidCallback: paidCallback ?? undefined,
        });

        await log(
          'registration',
          'pay',
          { registration, paymentMethod, price, code, paidCallback, amount },
          bookingId,
          user,
        );
      } catch (error) {
        if (error instanceof UnimplementedPaymentMethod) {
          // pass
        } else {
          throw error;
        }
      }

      const result = prisma.registration.update({
        ...query,
        where: { id: bookingId },
        data: { paymentMethod },
      });

      publish(registration.id, 'updated', registration);

      return result;
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
  paidCallback,
}: {
  from: string;
  to: string;
  amount: number;
  by: PaymentMethodPrisma;
  phone?: string;
  emailAddress?: string;
  registrationId?: string;
  paidCallback?: string;
}): Promise<string | undefined> {
  switch (by) {
    case 'Lydia': {
      if (!phone) throw new GraphQLError('Missing phone number');
      await payEventRegistrationViaLydia(phone, registrationId, paidCallback);
      return;
    }

    case 'PayPal': {
      if (!registrationId) throw new GraphQLError('Pas de réservation associée');
      return payEventRegistrationViaPaypal(registrationId, emailAddress ?? '');
    }

    default: {
      return new Promise((_resolve, reject) => {
        reject(
          new UnimplementedPaymentMethod(
            `Attempt to pay ${to} ${amount} from ${from} by ${by}: not implemented`,
          ),
        );
      });
    }
  }
}

class UnimplementedPaymentMethod extends Error {}
