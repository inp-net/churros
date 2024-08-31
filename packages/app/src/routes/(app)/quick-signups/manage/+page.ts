import { graphql } from '$houdini';

export async function load(event) {
  return await graphql(`
    query PageAppQuickSignupsManagePage {
      quickSignups {
        nodes {
          code
          validUntil
          expired
          school {
            ...AvatarSchool
          }
        }
      }
    }
  `)
    .fetch({ event })
    .then((d) => d.data ?? { quickSignups: { nodes: [] } });
}
