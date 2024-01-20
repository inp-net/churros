import { builder } from '#lib';

import * as Prisma from '@prisma/client';

export const DocumentTypeEnum = builder.enumType(Prisma.DocumentType, {
  name: 'DocumentType',
});
