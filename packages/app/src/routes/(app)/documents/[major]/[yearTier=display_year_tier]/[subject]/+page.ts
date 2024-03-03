import type { DocumentType$options } from '$houdini';
import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { ORDER_DOCUMENT_TYPES } from '$lib/display';
import type { AfterLoadEvent, DocumentsOfSubjectVariables } from './$houdini';

export const _DocumentsOfSubjectVariables: DocumentsOfSubjectVariables = async ({ params }) => {
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(params.yearTier);
  return { ...params, yearTier, forApprentices };
};

export async function _houdini_afterLoad({ data }: AfterLoadEvent) {
  const { documentsOfSubject } = data.DocumentsOfSubject;
  const documentsByType = ORDER_DOCUMENT_TYPES.map((type) => [
    type,
    documentsOfSubject?.nodes.filter((e) => e?.type === type),
  ]).sort(
    ([_, aDocs], [__, bDocs]) => Number(bDocs?.length > 0 ?? 0) - Number(aDocs?.length > 0 ?? 0),
  ) as Array<[DocumentType$options, (typeof documentsOfSubject)['nodes']]>;

  return { ...data, documentsByType };
}
