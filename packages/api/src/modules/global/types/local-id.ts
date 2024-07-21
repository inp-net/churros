import { builder } from '#lib';
import { RegularExpression } from 'graphql-scalars';

export const LOCAL_ID_PATTERN = /^(\w+:)?\w+$/;

const LocalIDScalarResolver = new RegularExpression('LocalID', LOCAL_ID_PATTERN);
export const LocalID = builder.addScalarType('LocalID', LocalIDScalarResolver, {
  description:
    'Un identifiant, dont le préfixe (par exemple, `a:` dans `a:627dgfd87ccc`) est optionnel.',
});
