import { OPTION_OTHER_VALUE } from '$lib/components/InputSelectOneRadios.svelte';
import { TYPENAMES_TO_ID_PREFIXES } from '$lib/typenames';
import { loadQuery, makeMutation } from '$lib/zeus.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { FORM_SECTION_HIDDEN_INPUT_NAME } from './_disabled+page.svelte';

export const actions = {
  async postAnswers({ fetch, request, cookies, params }) {
    const data = await request.formData();
    const sectionId = data.get(FORM_SECTION_HIDDEN_INPUT_NAME);
    if (!sectionId)
      error(400, { message: 'ID de la section du formulaire manquant dans la requête' });
    // Resolve answers from form data, including compounding multiple answers for the same question into arrays
    let answers = gatherAnswers(data);

    // Handle "other" option answers
    answers = handleOtherOptionAnswers(answers);

    try {
      const { answerFormSection } = await makeMutation(
        {
          answerFormSection: [
            {
              section: sectionId.toString(),
              answers: Object.entries(answers).map(([question, answer]) => ({
                question,
                answer,
              })),
            },
            {
              '__typename': true,
              '...on Error': {
                message: true,
              },
              '...on ZodError': {
                message: true,
              },
              '...on MutationAnswerFormSectionSuccess': {
                __typename: true,
              },
            },
          ],
        },
        { fetch, token: cookies.get('token') },
      );
      if (answerFormSection.__typename !== 'MutationAnswerFormSectionSuccess')
        return fail(400, { message: answerFormSection.message });
    } catch (error_) {
      error(400, { message: error_?.toString() ?? '' });
    }

    // Get next section, _after_ submitting answers
    const { form } = await loadQuery(
      {
        form: [
          { localId: params.form },
          {
            section: [{ id: params.section }, { nextSection: { localId: true } }],
          },
        ],
      },
      { fetch, token: cookies.get('token') },
    );

    if (form?.section.nextSection)
      redirect(302, `/forms/${params.form}/answer/${form.section.nextSection.localId}`);

    redirect(302, `/forms/${params.form}/answered`);
  },
};

function gatherAnswers(data: FormData) {
  const answers: Record<string, string[]> = {};
  for (const [name, value] of data.entries()) {
    if (name.startsWith(TYPENAMES_TO_ID_PREFIXES.Question + ':')) {
      if (answers[name]) answers[name].push(value.toString());
      else answers[name] = [value.toString()];
    }
  }
  return answers;
}

/** Resolve answers for questions with an "other" option.
 * - When the "other" option was selected, the answer is in the form of "questionId/other", and the "questionId" key is missing. We re-created the "questionId" key and set its value to the "other" answer, and remove the "questionId/other" key.
 * - When the "other" option was not selected, the answer is in the form of "questionId", and the "questionId/other" key is in an "unanswered" state (set to a single-element array with an empty string--since the text field is empty). We remove the "questionId/other" key.
 */
function handleOtherOptionAnswers(answers: Record<string, string[]>): Record<string, string[]> {
  const result = structuredClone(answers);
  for (const [question, answer] of Object.entries(result)) {
    // replace question with question/other's value if it exists
    // otherwise, remove /other from the answers
    if (question.endsWith('/other')) {
      const questionId = question.replace(/\/other$/, '');
      if (!result[questionId] || isUnanswered(result[questionId])) result[questionId] = answer;

      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete result[question];
    }
  }
  return result;
}

function isUnanswered(answer: string[]): boolean {
  return answer.length === 1 && answer[0] === OPTION_OTHER_VALUE;
}
