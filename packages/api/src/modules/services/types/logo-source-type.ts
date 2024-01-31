import { builder } from '#lib';
import {} from '#modules/global';
import { LogoSourceType } from '@prisma/client';
import {} from '../index.js';

export const LogoSourceTypeEnum = builder.enumType(LogoSourceType, { name: 'LogoSourceType' });
