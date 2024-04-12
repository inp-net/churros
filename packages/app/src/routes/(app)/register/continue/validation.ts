import { z } from 'zod';

export const schemas = {
  register: z
    .object({
      token: z.string().min(1),
      address: z.string(),
      birthday: z.date().nullable(),
      firstName: z.string().min(1),
      graduationYear: z.number().nullable(),
      lastName: z.string().min(1),
      majorId: z.string().min(1).nullable(),
      phone: z.string(),
      password: z.string().min(1),
      passwordConfirmation: z.string().min(1),
      cededImageRightsToTVn7: z.boolean(),
      apprentice: z.boolean(),
    })
    .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
      message: 'Les mots de passe ne correspondent pas.',
      path: ['passwordConfirmation'],
    }),
};
