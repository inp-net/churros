import { loadQuery } from '$lib/zeus';

export async function load({ fetch, parent, params }) {
  const { form } = loadQuery(
    {
      form: [
        params,
        {
          title: true,
          descriptionHtml: true,
	  hasSections: true,
          section: [{ id: params.section }, {
            id: true,
            descriptionHtml: true,
            title: true,
            questions: {
              id: true,
              'title': true,
              'descriptionHtml': true,
              'mandatory': true,
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
              },
            },
          }],
        },
      ],
    },
    { fetch, parent },
  );

  if (form?.hasSections) {
	  redirect(302, `./${form?.sections[0].id.replace(/^formsection:/, '')}`)
  }
  return { form }
}
