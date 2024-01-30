import { builder } from '#lib';

import * as Prisma from '@prisma/client';

export const PromotionTypeEnum = builder.enumType(Prisma.PromotionType, {
  name: 'PromotionType',
});
