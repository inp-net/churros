import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent, params }) {
  return loadQuery(
    {
      form: [
        {
          localId: params.form,
        },
        {
          id: true,
          canSeeAnswers: true,
          canModifyAnswers: true,
          myAnswers: {
            id: true,
            question: { title: true, anonymous: true },
            answerString: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
}
