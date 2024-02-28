import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import type { DocumentsOfSubjectVariables } from './$houdini';

export const _DocumentsOfSubjectVariables: DocumentsOfSubjectVariables = async ({ params }) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(params.yearTier);
  return { ...params, yearTier, forApprentices };
};
