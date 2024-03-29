import { redirectToLogin } from '$lib/session';
import { ZeusError, makeMutation } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url, params }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  try {
    const { claimPromotionCode } = await makeMutation(
      {
        claimPromotionCode: [{ code: params.code }, true],
      },
      { fetch, parent },
    );
    return {
      result: claimPromotionCode,
    };
  } catch (error) {
    if (error instanceof ZeusError) return { error: error.errors.map((e) => e.message).join(', ') };
    return { error };
  }
};
