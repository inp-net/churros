import { builder, localID } from '#lib';
import { GraphQLError } from 'graphql';
import { LocalID } from '../types/local-id.js';

builder.interfaceField(builder.nodeInterfaceRef(), 'localID', (t) =>
  t.field({
    type: LocalID,
    resolve: (node) => {
      if (node && typeof node === 'object' && 'id' in node && typeof node.id === 'string')
        return localID(node.id);

      throw new GraphQLError('Node sans identifiant. Ceci ne devrait jamais arriver.');
    },
    description: "L'identifiant local de la ressource (sans préfixe)",
  }),
);
