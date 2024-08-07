import { builder } from '#lib';

export const BooleanConstraint = builder.enumType('BooleanConstraint', {
  description: 'Contrainte booléenne, à trois états',
  values: {
    Only: {
      value: 'Only',
      description: 'Obliger la contrainte à être remplie',
    },
    DontCare: {
      value: 'DontCare',
      description: 'Ne pas prendre en compte la contrainte',
    },
    Not: {
      value: 'Not',
      description: 'Obliger la contrainte à ne pas être remplie',
    },
  },
});
