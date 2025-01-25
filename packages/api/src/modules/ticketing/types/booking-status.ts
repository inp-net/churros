import { builder } from '#lib';

export const BookingStateEnum = builder.enumType('BookingState', {
  values: {
    Paid: { value: 'Paid', description: 'Payée' },
    Verified: { value: 'Verified', description: 'Scannée' },
    Unpaid: { value: 'Unpaid', description: 'Non payée et non scannée' },
  },
});

export function bookingStatePrismaWhereClause(
  only: null | undefined | 'Paid' | 'Verified' | 'Unpaid',
) {
  if (!only) return {};
  return {
    Paid: { paid: true, verifiedAt: null },
    Verified: { verifiedAt: { not: null } },
    Unpaid: { paid: false, verifiedAt: null },
  }[only ?? 'Unpaid'];
}
