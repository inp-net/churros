import { makeMutation, Visibility } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';

export const actions = {
  async upsertForm({ fetch, cookies, request }) {
    const formData = await request.formData();
    const data = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, v.toString()]));

    const {
      upsertForm: { localId },
    } = await makeMutation(
      {
        upsertForm: [
          {
            input: {
              id: data.id || null,
              description: data.description,
              group: data['group/uid'],
              title: data.title,
              visibility: data.visibility as Visibility,
              closesAt: data['open-until'] ? new Date(data['open-until']) : null,
            },
          },
          {
            localId: true,
          },
        ],
      },
      { fetch, token: cookies.get('token') },
    );

    redirect(303, `/forms/${localId}/edit`);
  },
};
