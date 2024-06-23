import { builder } from '#lib';

import * as PrismaTypes from '@centraverse/db/prisma';

export const GroupEnumType = builder.enumType(PrismaTypes.GroupType, { name: 'GroupType' });
