import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
import { oauthEnabled, oauthInitiateLoginURL, oauthLoginBypassed } from '$lib/oauth';
import { route } from '$lib/ROUTES';
import { saveSessionToken } from '$lib/session';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { Login } from './mutations';

export async function load(event) {
  if (oauthEnabled() && !oauthLoginBypassed(event)) redirect(307, oauthInitiateLoginURL(event));
}

export const actions: Actions = {
  async default(event) {
    const formdata = Object.fromEntries(await event.request.formData().then((fd) => fd.entries()));
    const { error, data } = z
      .object({
        email: z.string().min(1),
        password: z.string().min(1),
      })
      .safeParse(formdata);

    if (!data) return fail(400, { serverErrors: error.errors.map((e) => e.message) });

    const { email, password } = data;

    const result = await Login.mutate({ emailOrUid: email, password }, { event });

    if (mutationSucceeded('login', result)) {
      saveSessionToken(event.cookies, result.data.login.data);

      return redirect(
        301,
        `${route('/login/done')}?${new URLSearchParams({
          from: event.url.searchParams.get('from') ?? '/',
        })}`,
      );
    }

    return fail(401, {
      serverErrors:
        result.data?.login.__typename === 'AwaitingValidationError'
          ? [
              "Ton compte n'a pas encore été validé par l'équipe d'administration de ton AE. Encore un peu de patience 😉",
            ]
          : mutationErrorMessages('login', result),
    });
  },
};
