import { builder } from '#lib';
import {} from '#modules/global';
import * as Prisma from '@prisma/client';
import {} from '../index.js';

export const PromotionTypeEnum = builder.enumType(Prisma.PromotionType, {
  name: 'PromotionType',
});
