import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent, params }) {
  return loadQuery(
    {
      form: [
        {
          localId: params.form,
        },
        {
          title: true,
        },
      ],
    },
    { fetch, parent },
  );
}
