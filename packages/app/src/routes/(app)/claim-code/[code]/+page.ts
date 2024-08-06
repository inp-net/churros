import { graphql } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const result = await graphql(`
    mutation ClaimPromotionCode($code: String!) {
      claimPromotionCode(code: $code)
    }
  `).mutate({ code: params.code }, { fetch });
  if (result.errors) {
    return {
      error: result.errors.map((e) => e.message).join(', '),
    };
  }
  return {
    result: Boolean(result.data?.claimPromotionCode),
  };
};
