import { builder } from '#lib';
import { RegularExpression } from 'graphql-scalars';

export const UID_REGEX_PATTERN = /^[\w-]{3,255}$/;

const UIDScalarResolver = new RegularExpression('UID', UID_REGEX_PATTERN);
export const UIDScalar = builder.addScalarType('UID', UIDScalarResolver, {});
