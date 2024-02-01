import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { ZodError } from 'zod';
import { saveUser } from '../index.js';

builder.mutationField('updateUserCandidate', (t) =>
  t.field({
    type: 'Boolean',
    authScopes: { canEditUsers: true },
    errors: { types: [ZodError] },
    args: {
      register: t.arg.boolean(),
      email: t.arg.string(),
      firstName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      lastName: t.arg.string({ validate: { minLength: 1, maxLength: 255 } }),
      majorId: t.arg.id(),
      graduationYear: t.arg.int({ validate: { min: 1900, max: 2100 } }),
      birthday: t.arg({ type: DateTimeScalar, required: false }),
      phone: t.arg.string({ validate: { maxLength: 255 } }),
      address: t.arg.string({ validate: { maxLength: 255 } }),
      cededImageRightsToTVn7: t.arg.boolean(),
    },
    async resolve(
      _,
      {
        register,
        email,
        firstName,
        lastName,
        majorId,
        graduationYear,
        address,
        birthday,
        phone,
        cededImageRightsToTVn7,
      },
    ) {
      const candidate = await prisma.userCandidate.update({
        where: { email },
        data: {
          address,
          birthday,
          firstName,
          majorId,
          graduationYear,
          lastName,
          phone,
          cededImageRightsToTVn7,
        },
      });
      if (register) await saveUser(candidate);
      return true;
    },
  }),
);
