import { z } from 'zod';

export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_string && issue.validation === 'email')
    return { message: 'Adresse email invalide.' };

  return { message: ctx.defaultError };
};
