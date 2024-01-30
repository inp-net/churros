import { builder } from '#lib';
import {} from '#modules/global';
import { UserType } from '#modules/users';
import {} from '../index.js';

builder.prismaObjectField(UserType, 'allowedApps', (t) => t.relation('allowedApps'));
