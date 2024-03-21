import { loadQuery } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';
import groupBy from 'lodash.groupby';

export async function load({ fetch, parent, params: { localId }, url: { searchParams } }) {
  const { form } = await loadQuery(
    {
      form: [
        { localId },
        {
          id: true,
          title: true,
          answerCount: true,
          linkedGoogleSheetUrl: true,
          questions: [
            {},
            {
              nodes: {
                title: true,
                descriptionHtml: true,
                id: true,
              },
            },
          ],
          answers: [
            { after: searchParams.get('after') },
            {
              pageInfo: { hasNextPage: true, endCursor: true },
              nodes: {
                id: true,
                updatedAt: true,
                createdBy: { id: true, uid: true, fullName: true, pictureFile: true },
                question: {
                  id: true,
                  title: true,
                  section: { title: true },
                },
                answerString: true,
              },
            },
          ],
        },
      ],
    },
    { fetch, parent },
  );

  if (!form) error(404);

  console.log(form.answers);



  return { form };
}
