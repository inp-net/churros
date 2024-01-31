import { builder } from '#lib';

// TODO rename to booking-counts

class RegistrationsCounts {
  total: number;
  paid: number;
  verified: number;
  unpaidLydia: number;
  cancelled: number;

  constructor(data: {
    total: number;
    paid: number;
    verified: number;
    unpaidLydia: number;
    cancelled: number;
  }) {
    this.total = data.total;
    this.paid = data.paid;
    this.verified = data.verified;
    this.unpaidLydia = data.unpaidLydia;
    this.cancelled = data.cancelled;
  }
}

export const RegistrationsCountsType = builder
  .objectRef<RegistrationsCounts>('RegistrationsCounts')
  .implement({
    fields: (t) => ({
      total: t.exposeFloat('total'),
      paid: t.exposeFloat('paid'),
      verified: t.exposeFloat('verified'),
      unpaidLydia: t.exposeFloat('unpaidLydia'),
      cancelled: t.exposeFloat('cancelled'),
    }),
  });
