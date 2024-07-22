import { builder, localID } from '#lib';
import type { InterfaceRef } from '@pothos/core';
import { LocalID } from '../types/local-id.js';

builder.interfaceField(
  builder.configStore.getOutputTypeRef('Node') as InterfaceRef<{ id: string }>,
  'localID',
  (t) =>
    t.field({
      type: LocalID,
      resolve: ({ id }) => localID(id),
      description: "L'identifiant local de la ressource (sans préfixe)",
    }),
);
