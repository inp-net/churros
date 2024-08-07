import { builder, prisma } from '#lib';
import { EventType } from '#modules/events';
import { ProfitsBreakdownType } from '#modules/payments/types';
import { PaymentMethod } from '@churros/db/prisma';

builder.prismaObjectField(EventType, 'profitsBreakdown', (t) =>
  t.field({
    type: ProfitsBreakdownType,
    async resolve({ id }) {
      const tickets = await prisma.ticket.findMany({
        where: { event: { id } },
      });
      const registrations = await prisma.registration.findMany({
        where: { ticket: { event: { id } } },
        include: { ticket: true },
      });
      const sumUp = (regs: typeof registrations) =>
        regs.reduce((acc, r) => acc + (r.paid ? r.ticket.price : 0), 0);

      return {
        total: sumUp(registrations),
        byPaymentMethod: Object.fromEntries(
          Object.entries(PaymentMethod).map(([_, value]) => [
            value,
            sumUp(registrations.filter((r) => r.paymentMethod === value)),
          ]),
        ) as Record<PaymentMethod, number>,
        byTicket: tickets.map(({ id }) => ({
          id,
          amount: sumUp(registrations.filter((r) => r.ticket.id === id)),
        })),
      };
    },
  }),
);
