import { loadQuery, Selector } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export const _answerNodeQuery = Selector('AnswersOfUser')({
  date: true,
  user: { id: true, uid: true, fullName: true, pictureFile: true },
  answers: {
    id: true,
    checkboxIsMarked: true,
    question: {
      id: true,
      title: true,
      section: { title: true },
    },
    answerString: true,
  },
});

export async function load({ fetch, parent, params, url: { searchParams } }) {
  const { form } = await loadQuery(
    {
      form: [
        { localId: params.form },
        {
          id: true,
          localId: true,
          answerCount: true,
          linkedGoogleSheetUrl: true,
          checkboxesAreEnabled: true,
          canSetCheckboxes: true,
          canSeeAnswerStats: true,
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
          answersByUser: [
            { after: searchParams.get('after') },
            {
              pageInfo: { hasNextPage: true, endCursor: true },
              edges: { cursor: true, node: _answerNodeQuery },
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
