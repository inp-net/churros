import { makeMutation } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';
import omit from 'lodash.omit';
import { z } from 'zod';

export const actions = {
  async upsertSection({ fetch, cookies, request, params }) {
    const rawData = await request.formData();

    const data = z
      .object({
        'section-id': z.string().optional(),
        'title': z.string(),
        'description': z.string(),
      })
      .parse(Object.fromEntries(rawData.entries()));

    const { upsertFormSection } = await makeMutation(
      {
        upsertFormSection: [
          {
            input: {
              formId: params.form,
              id: data['section-id'],
              ...omit(data, 'section-id'),
            },
          },
          {
            localId: true,
          },
        ],
      },
      { fetch, token: cookies.get('token') },
    );

    if (upsertFormSection)
      redirect(303, `/forms/${params.form}/edit?section=${upsertFormSection.localId}`);
  },
};
