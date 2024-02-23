import { builder } from '#lib';

import * as PrismaTypes from '@prisma/client';

export const GroupEnumType = builder.enumType(PrismaTypes.GroupType, { name: 'GroupType' });
