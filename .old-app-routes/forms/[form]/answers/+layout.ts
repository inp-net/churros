import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent, params }) {
  return loadQuery(
    {
      form: [
        { localId: params.form },
        {
          title: true,
          visibility: true,
          group: {
            uid: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
}
