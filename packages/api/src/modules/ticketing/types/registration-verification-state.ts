import { builder } from '#lib'
import {} from '#modules/global'
import {} from '../index.js'
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
