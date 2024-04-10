export const UNAUTHORIZED_ERROR_MESSAGE = "Tu n'es pas autorisé à effectuer cette action.";

export class UnauthorizedError extends Error {
  constructor() {
    super(UNAUTHORIZED_ERROR_MESSAGE);
  }
}
