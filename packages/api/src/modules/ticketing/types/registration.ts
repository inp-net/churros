import { builder, localID, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { PaymentMethodEnum } from '#modules/payments';
import { UserType, fullName } from '#modules/users';
import type { Prisma } from '@churros/db/prisma';
import { authorIsBeneficiary, canScanBookings, canScanBookingsPrismaIncludes } from '../index.js';

export const RegistrationPrismaIncludes = {
  lydiaTransaction: true,
  ticket: true,
} as const satisfies Prisma.RegistrationInclude;

// TODO rename to booking
export const RegistrationType = builder.prismaNode('Registration', {
  id: { field: 'id' },
  include: RegistrationPrismaIncludes,
  fields: (t) => ({
    canManage: t.boolean({
      description:
        "L'utilisateur.ice connecté.e peut marquer la réservation comme payée, la valider, etc.",
      async resolve({ ticket: { eventId } }, _, { user }) {
        const event = await prisma.event.findUniqueOrThrow({
          where: { id: eventId },
          include: canScanBookingsPrismaIncludes,
        });
        return canScanBookings(event, user);
      },
    }),
    code: t.string({
      resolve({ id }) {
        return localID(id).toUpperCase();
      },
    }),
    ticketId: t.exposeID('ticketId'),
    authorId: t.exposeID('authorId', { nullable: true }),
    beneficiary: t.string({
      resolve({ externalBeneficiary }) {
        return externalBeneficiary ?? '';
      },
      deprecationReason: 'Use `externalBeneficiary` instead.',
    }),
    externalBeneficiary: t.exposeString('externalBeneficiary', { nullable: true }),
    beneficiaryUser: t.prismaField({
      type: UserType,
      nullable: true,
      async resolve(query, { internalBeneficiaryId }) {
        // eslint-disable-next-line unicorn/no-null
        if (!internalBeneficiaryId) return null;
        return prisma.user.findUnique({
          ...query,
          where: { id: internalBeneficiaryId },
        });
      },
    }),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    verifiedAt: t.expose('verifiedAt', { type: DateTimeScalar, nullable: true }),
    verifiedBy: t.relation('verifiedBy', { nullable: true }),
    verified: t.boolean({
      resolve({ verifiedAt, verifiedById }) {
        return Boolean(verifiedAt && verifiedById);
      },
    }),
    paymentMethod: t.expose('paymentMethod', { type: PaymentMethodEnum, nullable: true }),
    paid: t.exposeBoolean('paid'),
    opposedAt: t.expose('opposedAt', { type: DateTimeScalar, nullable: true }),
    opposedBy: t.relation('opposedBy', { nullable: true }),
    opposed: t.boolean({
      resolve({ opposedAt, opposedById }) {
        return Boolean(opposedAt && opposedById);
      },
    }),
    cancelledAt: t.expose('cancelledAt', { type: DateTimeScalar, nullable: true }),
    cancelledBy: t.relation('cancelledBy', { nullable: true }),
    cancelled: t.boolean({
      resolve({ cancelledAt, cancelledById }) {
        return Boolean(cancelledAt && cancelledById);
      },
    }),
    pendingPayment: t.boolean({
      description: "Une demande de paiement a été effectuée mais la place n'est pas encore payée",
      resolve({ lydiaTransaction, paymentMethod, paid }) {
        if (paid) return false;
        if (paymentMethod === 'Lydia') return Boolean(lydiaTransaction);
        return Boolean(paymentMethod);
      },
    }),
    awaitingPayment: t.boolean({
      description: "En attente du démarrage du paiement par l'utilisateur.ice",
      resolve({ paid, cancelledAt, opposedAt, paymentMethod, lydiaTransaction }) {
        if (paid || cancelledAt || opposedAt) return false;
        // If we chose a payment method but no Lydia transaction was started yet we're still awaiting payment
        if (paymentMethod === 'Lydia' && lydiaTransaction) return false;
        return !paymentMethod;
      },
    }),
    wantsToPay: t.exposeFloat('wantsToPay', { nullable: true }),
    ticket: t.relation('ticket'),
    author: t.relation('author', { nullable: true }),
    authorEmail: t.exposeString('authorEmail'),
    authorIsBeneficiary: t.boolean({
      async resolve({ authorId, authorEmail, internalBeneficiaryId, externalBeneficiary }) {
        if (!authorId) return true;
        const author = await prisma.user.findUnique({ where: { id: authorId } });
        if (!author) return false;
        return authorIsBeneficiary(
          { ...author, fullName: fullName(author) },
          externalBeneficiary,
          internalBeneficiaryId,
          authorEmail,
        );
      },
    }),
  }),
});
