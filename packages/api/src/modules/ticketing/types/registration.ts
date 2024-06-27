import { TYPENAMES_TO_ID_PREFIXES, builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { PaymentMethodEnum } from '#modules/payments';
import { UserType, fullName } from '#modules/users';
import { authorIsBeneficiary, preprocessBeneficiary } from '../index.js';
// TODO rename to booking

export const RegistrationType = builder.prismaNode('Registration', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.string({
      resolve({ id }) {
        return id.replace(TYPENAMES_TO_ID_PREFIXES.Registration + ':', '');
      },
    }),
    ticketId: t.exposeID('ticketId'),
    authorId: t.exposeID('authorId', { nullable: true }),
    beneficiary: t.exposeString('beneficiary'),
    beneficiaryUser: t.prismaField({
      type: UserType,
      nullable: true,
      async resolve(query, { beneficiary }) {
        // eslint-disable-next-line unicorn/no-null
        if (!beneficiary) return null;
        return prisma.user.findUnique({
          ...query,
          where: { uid: preprocessBeneficiary(beneficiary) },
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
    ticket: t.relation('ticket'),
    author: t.relation('author', { nullable: true }),
    authorEmail: t.exposeString('authorEmail'),
    authorIsBeneficiary: t.boolean({
      async resolve({ authorId, authorEmail, beneficiary }) {
        if (!authorId) return true;
        const author = await prisma.user.findUnique({ where: { id: authorId } });
        if (!author) return false;
        return authorIsBeneficiary(
          { ...author, fullName: fullName(author) },
          beneficiary,
          authorEmail,
        );
      },
    }),
  }),
});
