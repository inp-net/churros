import { loadQuery, Selector } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export const _questionQuery = Selector('Question')({
  'id': true,
  'title': true,
  'mandatory': true,
  'type': true,
  'anonymous': true,
  'description': true,
  'order': true,
  '__typename': true,
  '...on QuestionScale': {
    minimum: true,
    minimumLabel: true,
    maximum: true,
    maximumLabel: true,
  },
  '...on QuestionSelectOne': {
    options: true,
    allowOptionsOther: true,
  },
  '...on QuestionSelectMultiple': {
    options: true,
    allowOptionsOther: true,
  },
  '...on QuestionScalar': {
    __typename: true,
  },
});

export async function load({ fetch, parent, params }) {
  const { form, me } = await loadQuery(
    {
      form: [
        { localId: params.form },
        {
          title: true,
          id: true,
          opensAt: true,
          closesAt: true,
          description: true,
          visibility: true,
          group: {
            uid: true,
            id: true,
            pictureFile: true,
            pictureFileDark: true,
            name: true,
          },
          sections: {
            order: true,
            title: true,
            id: true,
            localId: true,
            description: true,
            questions: _questionQuery,
          },
        },
      ],
      me: {
        boardMemberships: {
          group: {
            uid: true,
            id: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
          },
        },
      },
    },
    { fetch, parent },
  );

  if (!form) error(404, { message: 'Formulaire introuvable' });
  return {
    me,
    form: {
      ...form,
      description: form.description ?? '',
    },
  };
}
