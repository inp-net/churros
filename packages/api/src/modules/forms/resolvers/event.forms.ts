import { builder } from '#lib';
import { EventType } from '#modules/events';
import {} from '#modules/global';
import {} from '../index.js';

builder.prismaObjectField(EventType, 'forms', (t) => t.relation('Form'));
