import { builder } from '#lib';
import { DateTimeResolver } from 'graphql-scalars';

export const DateTimeScalar = builder.addScalarType('DateTime', DateTimeResolver, {});
