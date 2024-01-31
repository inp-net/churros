import { builder } from '#lib';
import {} from '#modules/global';
import * as PrismaTypes from '@prisma/client';
import {} from '../index.js';

export const GroupEnumType = builder.enumType(PrismaTypes.GroupType, { name: 'GroupType' });
