import { builder } from '#lib';
import { EventDraftStep } from '@prisma/client';

export const EventDraftStepType = builder.enumType(EventDraftStep, {
  description: "Étape de création d'un évènement",
  name: 'EventDraftStep',
});
