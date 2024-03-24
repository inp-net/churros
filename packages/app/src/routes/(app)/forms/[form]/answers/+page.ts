import { loadQuery, Selector } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export const _answerNodeQuery = Selector('Answer')({
  id: true,
  updatedAt: true,
  createdBy: { id: true, uid: true, fullName: true, pictureFile: true },
  question: {
    id: true,
    title: true,
    section: { title: true },
  },
  answerString: true,
});

export async function load({ fetch, parent, params, url: { searchParams } }) {
  const { form } = await loadQuery(
    {
      form: [
        { localId: params.form },
        {
          id: true,
          localId: true,
          title: true,
          visibility: true,
          answerCount: true,
          linkedGoogleSheetUrl: true,
          group: {
            uid: true,
            pictureFile: true,
            pictureFileDark: true,
            name: true,
          },
          event: {
            group: { uid: true },
            uid: true,
            title: true,
          },
          questions: [
            {},
            {
              nodes: {
                title: true,
                descriptionHtml: true,
                id: true,
                anonymous: true,
              },
            },
          ],
          answers: [
            { after: searchParams.get('after') },
            {
              pageInfo: { hasNextPage: true, endCursor: true },
              nodes: _answerNodeQuery,
            },
          ],
        },
      ],
    },
    { fetch, parent },
  );

  if (!form) error(404);

  return { form };
}
