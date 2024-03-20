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
                createdAt: true,
                createdBy: { uid: true, fullName: true, pictureFile: true },
                question: {
                  title: true,
                  section: { title: true },
                },
                __typename: true,
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

  console.log(form.answers)

  /**
   * Grouped answers, by user uid then by question ID
   */
  let groupedAnswers: Record<string, Record<string, (typeof form.answers.nodes)[number]>> = {};

  const byUser = groupBy(form.answers.nodes, (a) => a.createdBy?.uid);
  groupedAnswers = Object.fromEntries(
    Object.entries(byUser).map(([uid, answers]) => [uid, groupBy(answers, (a) => a.question.id)]),
  );

  return { form, groupedAnswers };
}
