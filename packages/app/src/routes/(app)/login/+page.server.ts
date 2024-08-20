import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
import { saveSessionToken } from '$lib/session';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { Login } from './mutations';

export const actions: Actions = {
  async default(event) {
    const formdata = Object.fromEntries(await event.request.formData().then((fd) => fd.entries()));
    const { email, password } = await z
      .object({
        email: z.string().min(1),
        password: z.string().min(1),
      })
      .parseAsync(formdata)
      .catch((error) => {
        throw fail(400, {
          serverErrors: error.errors,
        });
      });

    const result = await Login.mutate({ emailOrUid: email, password }, { event });

    if (mutationSucceeded('login', result)) {
      saveSessionToken(event.cookies, result.data.login.data);
      let url = new URL(
        event.url.searchParams.get('to') ?? event.url.searchParams.get('from') ?? '/',
        event.url,
      );
      if (url.origin !== event.url.origin || url.pathname.startsWith('/login'))
        url = new URL('/', event.url);

      const searchParams = new URLSearchParams(
        [...event.url.searchParams.entries()].filter(([k]) => k !== 'to' && k !== 'from'),
      );

      return redirect(301, new URL(`${url.toString()}?${searchParams.toString()}`));
    }

    throw fail(401, {
      serverErrors:
        result.data?.login.__typename === 'AwaitingValidationError'
          ? [
              "Ton compte n'a pas encore été validé par l'équipe d'administration de ton AE. Encore un peu de patience 😉",
            ]
          : mutationErrorMessages('login', result),
    });
  },
};
