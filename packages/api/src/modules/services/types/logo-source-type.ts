import { builder } from '#lib';

import { LogoSourceType } from '@centraverse/db/prisma';

export const LogoSourceTypeEnum = builder.enumType(LogoSourceType, { name: 'LogoSourceType' });
