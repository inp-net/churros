import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent, params }) {
  return loadQuery(
    {
      form: [
        { localId: params.form },
        {
          id: true,
          answerCount: true,
          linkedGoogleSheetUrl: true,
          event: {
            group: { uid: true },
            uid: true,
            title: true,
          },
          questions: [
            { first: 100 },
            {
              nodes: {
                'id': true,
                'title': true,
                'totalAnswers': true,
                '__typename': true,
                '...on QuestionSelectMultiple': {
                  answerCounts: {
                    key: true,
                    value: true,
                  },
                },
                '...on QuestionSelectOne': {
                  answerCounts: {
                    key: true,
                    value: true,
                  },
                  options: true,
                  groups: { color: true, name: true },
                },
                '...on QuestionScale': {
                  maximum: true,
                  minimum: true,
                  answerCounts: {
                    key: true,
                    value: true,
                  },
                },
              },
            },
          ],
        },
      ],
    },
    { fetch, parent },
  );
}
