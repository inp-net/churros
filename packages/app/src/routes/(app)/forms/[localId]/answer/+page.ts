import { loadQuery } from '$lib/zeus';

export async function load({ fetch, parent, params }) {
  return loadQuery(
    {
      form: [
        params,
        {
          title: true,
          descriptionHtml: true,
          sections: {
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
                labels: true,
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
        },
      ],
    },
    { fetch, parent },
  );
}
