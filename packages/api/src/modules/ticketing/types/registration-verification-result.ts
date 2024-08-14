import { builder } from '#lib';

import type { Registration, User } from '@churros/db/prisma';
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
  // eslint-disable-next-line @typescript-eslint/parameter-properties
  message?: string;

  constructor(
    state: RegistrationVerificationState,
    registration?: Registration & { verifiedBy?: User | null },
    message?: string,
  ) {
    this.state = state;
    this.registration = registration;
    this.message = message;
  }
}

export const RegistrationVerificationResultType = builder
  .objectRef<RegistrationVerificationResult>('RegistrationVerificationResult')
  .implement({
    fields: (t) => ({
      state: t.expose('state', { type: RegistrationVerificationStateType }),
      message: t.exposeString('message', { nullable: true }),
      registration: t.expose('registration', { nullable: true, type: RegistrationType }),
    }),
  });
