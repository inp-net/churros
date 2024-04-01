import { loadQuery, Selector } from '$lib/zeus';
import { error } from '@sveltejs/kit';

export async function load({ fetch, parent, params }) {
  // Zeus's __alias typing are incorrect inside inline fragments.
  // the __alias field actually exists and works inside inline fragments, but types suggest the opposite.
  // to still get typing for the response, we trick typescript into thinking the query is the original query, without those aliases (formQuery) but add them before calling loadQuery.

  const formQuery = Selector('Form')({
    title: true,
    visibility: true,
    localId: true,
    descriptionHtml: true,
    hasSections: true,
    linkedGoogleSheetUrl: true,
    opensAt: true,
    closesAt: true,
    canModifyAnswers: true,
    group: {
      uid: true,
      name: true,
      pictureFile: true,
      pictureFileDark: true,
    },
    section: [
      { id: params.section },
      {
        id: true,
        descriptionHtml: true,
        description: true,
        title: true,
        questions: {
          'id': true,
          'title': true,
          'descriptionHtml': true,
          'description': true,
          'mandatory': true,
          'anonymous': true,
          'myAnswer': {
            __typename: true,
            answerString: true,
          },
          '__typename': true,
          'type': true,
          '...on QuestionFileUpload': {
            allowedFileTypes: true,
          },
          '...on QuestionScale': {
            maximum: true,
            minimum: true,
            maximumLabel: true,
            minimumLabel: true,
          },
          '...on QuestionSelectMultiple': {
            options: true,
            allowOptionsOther: true,
          },
          '...on QuestionSelectOne': {
            options: true,
            allowOptionsOther: true,
            groups: {
              pictureFile: true,
              pictureFileDark: true,
              uid: true,
              name: true,
            },
          },
        },
      },
    ],
  });

  const queryWithAliases = {
    ...formQuery,
    section: [
      formQuery.section[0],
      {
        ...formQuery.section[1],
        questions: {
          ...formQuery.section[1].questions,
          myAnswer: {
            ...formQuery.section[1].questions.myAnswer,
            '...on AnswerScale': {
              __alias: {
                number: {
                  value: true,
                },
              },
            },
            '...on AnswerSelectMultiple': {
              __alias: {
                selection: {
                  value: true,
                },
              },
            },
          },
        },
      },
    ],
  } as unknown as typeof formQuery;

  const data = await loadQuery(
    {
      form: [{ localId: params.form }, queryWithAliases],
    },
    { fetch, parent },
  );

  if (!data.form) error(404, { message: 'Formulaire introuvable' });

  return { ...data, form: data.form! };
}
