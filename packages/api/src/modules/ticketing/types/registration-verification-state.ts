import { builder } from '#lib';

// TODO rename to booking-verification-state

export enum RegistrationVerificationState {
  Ok,
  NotPaid,
  AlreadyVerified,
  NotFound,
  Opposed,
  OtherEvent,
}

export const RegistrationVerificationStateType = builder.enumType(RegistrationVerificationState, {
  name: 'RegistrationVerificationState',
});
