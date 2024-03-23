import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent, params }) {
  return loadQuery(
    {
      form: [
        {
          localId: params.localId,
        },
        {
          id: true,
          myAnswers: {
            id: true,
            question: { title: true },
            answerString: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
}
