import { OPTION_OTHER_VALUE } from '$lib/components/InputSelectOneRadios.svelte';
import { TYPENAMES_TO_ID_PREFIXES } from '$lib/typenames';
import { makeMutation } from '$lib/zeus.js';
import { error, redirect } from '@sveltejs/kit';
import { FORM_SECTION_HIDDEN_INPUT_NAME } from './+page.svelte';

export const actions = {
  async postAnswers({ fetch, request, cookies }) {
    const data = await request.formData();
    const sectionId = data.get(FORM_SECTION_HIDDEN_INPUT_NAME);
    if (!sectionId)
      error(400, { message: 'ID de la section du formulaire manquant dans la requête' });

    // Resolve answers from form data, including compounding multiple answers for the same question into arrays
    let answers = gatherAnswers(data);

    // Handle "other" option answers
    answers = handleOtherOptionAnswers(answers);

    await makeMutation(
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
            __typename: true,
          },
        ],
      },
      { fetch, token: cookies.get('token') },
    ).catch((e) => {
      error(400, { message: e?.toString() });
    });

    redirect(307, '../answered');
  },
};

function gatherAnswers(data: any) {
  let answers: Record<string, string[]> = {};
  for (let [name, value] of data.entries()) {
    if (name.startsWith(TYPENAMES_TO_ID_PREFIXES.Question + ':')) {
      if (answers[name]) {
        answers[name].push(value.toString());
      } else {
        answers[name] = [value.toString()];
      }
    }
  }
  return answers;
}

/** Resolve answers for questions with an "other" option.
 * - When the "other" option was selected, the answer is in the form of "questionId/other", and the "questionId" key is missing. We re-created the "questionId" key and set its value to the "other" answer, and remove the "questionId/other" key.
 * - When the "other" option was not selected, the answer is in the form of "questionId", and the "questionId/other" key is in an "unanswered" state (set to a single-element array with an empty string--since the text field is empty). We remove the "questionId/other" key.
 */
function handleOtherOptionAnswers(answers: Record<string, string[]>): Record<string, string[]> {
  let result = structuredClone(answers);
  for (let [question, answer] of Object.entries(result)) {
    // replace question with question/other's value if it exists
    // otherwise, remove /other from the answers
    if (question.endsWith('/other')) {
      const questionId = question.replace(/\/other$/, '');
      console.log({
        questionId,
        qidans: result[questionId],
        answer,
      });
      if (!result[questionId] || isUnanswered(result[questionId])) {
        result[questionId] = answer;
      }
      delete result[question];
    }
  }
  return result;
}

function isUnanswered(answer: string[]): boolean {
  return answer.length === 1 && answer[0] === OPTION_OTHER_VALUE;
}
