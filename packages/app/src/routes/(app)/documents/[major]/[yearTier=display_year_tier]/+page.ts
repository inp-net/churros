import type { DocumentsOfMajorOfYearTierVariables } from './$houdini';

export const _DocumentsOfMajorOfYearTierVariables: DocumentsOfMajorOfYearTierVariables = async ({
  params,
}) => {
  const yearTier = Number.parseInt(params.yearTier.replace(/a(-fis(e|a))?$/, ''), 10);
  const forApprentices = params.yearTier.endsWith('a-fisa');
  return { ...params, yearTier, forApprentices };
};
