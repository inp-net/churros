import { ensureIdPrefix } from '$lib/typenames.js';
import { loadQuery } from '$lib/zeus';
import { error } from '@sveltejs/kit';

export async function load({ fetch, parent, params }) {
  const { form } = await loadQuery(
    {
      form: [
        { localId: params.localId },
        {
          title: true,
          descriptionHtml: true,
          hasSections: true,
          linkedGoogleSheetUrl: true,
          section: [
            { id: params.section ? ensureIdPrefix('FormSection', params.section) : undefined },
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

  if (!form) {
    error(404, { message: 'Formulaire introuvable' });
  }

  return { form };
}
