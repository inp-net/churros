import { builder } from '#lib';

// TODO rename to booking-counts

type RegistrationsCounts = {
  total: number;
  paid: number;
  verified: number;
  unpaidLydia: number;
  cancelled: number;
};

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
