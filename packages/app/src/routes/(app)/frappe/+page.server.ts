import { load_FrappeRedirect } from '$houdini';
import { redirectToLogin } from '$lib/session';
import { makeMutation } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
  const { url, locals } = event;
  const { token } = locals;
  const { FrappeRedirect } = await load_FrappeRedirect({
    event,
  });

  const me = get(FrappeRedirect).data?.me;
  if (!token || !me) throw redirectToLogin(url.pathname);

  try {
    void makeMutation(
      { updateSubjectsExamDates: true },
      {
        fetch,
        token,
      },
    );
  } catch (error) {
    console.error(`Could not update subject exam dates: ${error?.toString() ?? ''}`);
  }

  throw redirect(
    303,
    me.major
      ? me.yearTier > 3
        ? `/documents/${me.major.uid}`
        : `/documents/${me.major.uid}/${me.yearTier}a${
            me.yearTier === 3 ? '' : me.apprentice ? '-fisa' : '-fise'
          }/`
      : '/documents/',
  );
}
