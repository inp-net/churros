import { builder } from '#lib';
import {} from '#modules/global';
import * as Prisma from '@prisma/client';
import {} from '../index.js';

export const DocumentTypeEnum = builder.enumType(Prisma.DocumentType, {
  name: 'DocumentType',
});
