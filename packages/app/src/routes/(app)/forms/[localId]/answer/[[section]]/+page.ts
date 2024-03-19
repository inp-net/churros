import { loadQuery } from '$lib/zeus';

export async function load({ fetch, parent, params }) {
  const { form } = await loadQuery(
    {
      form: [
        params,
        {
          title: true,
          descriptionHtml: true,
          hasSections: true,
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
            },
          ],
        },
      ],
    },
    { fetch, parent },
  );

  return { form };
}
