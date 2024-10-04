import { env } from '$env/dynamic/public';
import { graphql } from '$houdini';
import { text } from '@sveltejs/kit';

export async function GET(event) {
  const storagePath = new URL(env.PUBLIC_STORAGE_URL);
  const groups = await graphql(`
    query RobotsTxt {
      groups {
        uid
        localID
        pictureURL
        pictureURLDark: pictureURL(dark: true)
      }
      studentAssociations {
        uid
        pictureURL
      }
      majors {
        uid
        pictureURL
      }
      schools {
        uid
        pictureURL
      }
    }
  `)
    .fetch({ event })
    .then((d) =>
      d.data
        ? [...d.data.groups, ...d.data.studentAssociations, ...d.data.majors, ...d.data.schools]
        : [],
    );
  const frontendOrigin = new URL(env.PUBLIC_FRONTEND_ORIGIN).origin;
  return text(
    [
      'User-agent: *',
      // Start by disallow storage and /*.png
      storagePath.origin === frontendOrigin ? `Disallow: ${storagePath.pathname}` : '',
      'Disallow: /*.png',
      // Re-allow public profile pictures: groups, student associations, majors, schools
      ...groups.flatMap((group) => [
        group.pictureURL && new URL(group.pictureURL).origin === frontendOrigin
          ? `Allow: ${new URL(group.pictureURL).pathname}`
          : '',
        'pictureURLDark' in group &&
        typeof group.pictureURLDark === 'string' &&
        group.pictureURLDark &&
        new URL(group.pictureURLDark).origin === frontendOrigin
          ? `Allow: ${new URL(group.pictureURLDark).pathname}`
          : '',
        `Allow: /${group.uid}.png`,
      ]),
    ]
      .filter(Boolean)
      .join('\n'),
  );
}
