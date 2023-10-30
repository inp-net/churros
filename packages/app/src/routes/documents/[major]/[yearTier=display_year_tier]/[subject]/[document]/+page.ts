import { parseDisplayYearTierAndForApprentices } from '$lib/dates';
import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  const { yearTier, forApprentices } = parseDisplayYearTierAndForApprentices(params.yearTier);
  return loadQuery(
    {
      major: [{ uid: params.major }, { name: true, shortName: true, uid: true }],
      subject: [
        { uid: params.subject, yearTier, forApprentices },
        { name: true, shortName: true, uid: true, id: true, emoji: true },
      ],
      document: [
        {
          subjectUid: params.subject,
          subjectYearTier: yearTier,
          subjectForApprentices: forApprentices,
          documentUid: params.document,
        },
        {
          title: true,
          id: true,
          type: true,
          schoolYear: true,
          descriptionHtml: true,
          solutionPaths: true,
          paperPaths: true,
          createdAt: true,
          updatedAt: true,
          subject: {
            name: true,
            uid: true,
            minors: {
              uid: true,
            },
            majors: {
              uid: true,
            },
          },
          uploader: {
            uid: true,
            pictureFile: true,
            fullName: true,
          },
          comments: [
            {
              first: 100,
            },
            {
              edges: {
                node: {
                  id: true,
                  author: { uid: true, fullName: true, pictureFile: true },
                  bodyHtml: true,
                  body: true,
                  inReplyToId: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          ],
        },
      ],
    },
    { fetch, parent },
  );
};
