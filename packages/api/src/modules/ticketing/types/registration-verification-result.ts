import { builder } from '#lib';

import type { Registration, User } from '@prisma/client';
import {
  RegistrationType,
  RegistrationVerificationState,
  RegistrationVerificationStateType,
} from '../index.js';
// TODO rename to booking-verification-result

export class RegistrationVerificationResult {
  // eslint-disable-next-line @typescript-eslint/parameter-properties
  state: RegistrationVerificationState;
  // eslint-disable-next-line @typescript-eslint/parameter-properties
  registration?: Registration & { verifiedBy?: User | null };

  constructor(
    state: RegistrationVerificationState,
    registration?: Registration & { verifiedBy?: User | null },
  ) {
    this.state = state;
    this.registration = registration;
  }
}

export const RegistrationVerificationResultType = builder
  .objectRef<RegistrationVerificationResult>('RegistrationVerificationResult')
  .implement({
    fields: (t) => ({
      state: t.expose('state', { type: RegistrationVerificationStateType }),
      registration: t.expose('registration', { nullable: true, type: RegistrationType }),
    }),
  });
