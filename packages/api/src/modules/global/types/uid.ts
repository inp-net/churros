import { builder } from '#lib';
import { RegularExpression } from 'graphql-scalars';

// Scalar must allow 2-chars UIDs because we have some UIDs with 2 chars already.
export const UID_REGEX_PATTERN = /^[\w-]{2,255}$/;

const UIDScalarResolver = new RegularExpression('UID', UID_REGEX_PATTERN);
export const UIDScalar = builder.addScalarType('UID', UIDScalarResolver, {});
