import { DirectiveLocation } from '@graphql-tools/utils';
import { GraphQLDirective, GraphQLString } from 'graphql';

export const graphinxDirective = new GraphQLDirective({
  name: 'graphinx',
  locations: [
    DirectiveLocation.OBJECT,
    DirectiveLocation.FIELD_DEFINITION,
    DirectiveLocation.SCALAR,
    DirectiveLocation.ENUM,
    DirectiveLocation.UNION,
    DirectiveLocation.INTERFACE,
    DirectiveLocation.INPUT_OBJECT,
  ],
  args: {
    module: {
      type: GraphQLString,
    },
  },
});

export type GraphinxDirective = {
  locations:
    | 'OBJECT'
    | 'FIELD_DEFINITION'
    | 'SCALAR'
    | 'ENUM'
    | 'UNION'
    | 'INTERFACE'
    | 'INPUT_OBJECT';
  args: {
    module: string;
  };
};

export function graphinx<T extends string>(module: T) {
  return {
    directives: {
      graphinx: {
        module,
      },
    },
  } as const;
}
