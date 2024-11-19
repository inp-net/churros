import { builder } from '#lib';
// importing from #modules/event causes a circular import error
import { EventManagerType } from './event-manager.js';
import { InheritedEventManagerType } from './inherited-event-manager.js';

builder.unionType('EventManagerMaybeInherited', {
  description:
    "Manager d'évènemet, qu'il soit sur l'évènement directement ou hérité d'une appartenance à un groupe",
  types: [EventManagerType, InheritedEventManagerType],
});
