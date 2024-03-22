import { getMe, redirectToLogin } from '$lib/session';
import { ZeusError, makeMutation } from '$lib/zeus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, parent, url, params } = event;
  const me = await getMe(event);
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
