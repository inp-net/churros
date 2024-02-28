import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { type DocumentVariables } from './$houdini';

export const _DocumentVariables: DocumentVariables = async ({ params }) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(params.yearTier);
  return { ...params, yearTier, forApprentices };
};
