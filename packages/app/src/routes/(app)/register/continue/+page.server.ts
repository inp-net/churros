import { graphql } from '$houdini';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { schemas } from './validation';

export const actions = {
  register: async (event) => {
    const form = await superValidate(event.request, zod(schemas.register));

    if (!form.valid) return fail(400, { form });

    const mutation = graphql(`
      mutation CompleteRegistration($input: CompleteRegistrationInput!) {
        completeRegistration(input: $input) {
          __typename
          ... on Error {
            message
          }
          ... on MutationCompleteRegistrationSuccess {
            data
          }
        }
      }
    `);

    const { errors, data } = await mutation.mutate(
      {
        input: form.data,
      },
      { event },
    );

    if (errors || !data) return message(form, "Erreur lors de l'inscription.");

    const { __typename } = data.completeRegistration;

    if (__typename === 'Error') return message(form, data.completeRegistration.message);

    return message(form, 'Inscription réussie!');
  },
};
