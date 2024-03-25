import { loadQuery } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, parent, params }) {
  const { form, me } = await loadQuery(
    {
      form: [
        { localId: params.form },
        {
          title: true,
          id: true,
          opensAt: true,
          closesAt: true,
          description: true,
          visibility: true,
          group: {
            uid: true,
            id: true,
            pictureFile: true,
            pictureFileDark: true,
            name: true,
          },
          sections: {
            order: true,
            title: true,
            localId: true,
            description: true,
            questions: {
              title: true,
              mandatory: true,
              anonymous: true,
              description: true,
              order: true,
            },
          },
        },
      ],
      me: {
        boardMemberships: {
          group: {
            uid: true,
            id: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
          },
        },
      },
    },
    { fetch, parent },
  );

  if (!form) error(404, { message: 'Formulaire introuvable' });
  return {
    me,
    form: {
      ...form,
      description: form.description ?? '',
    },
  };
}
