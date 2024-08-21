import { graphql } from '$houdini';
import { error } from '@sveltejs/kit';

export async function load(event) {
  const result = await graphql(`
    query PageUserEdit($uid: String!) {
      user(uid: $uid) {
        id
        uid
        email
        otherEmails
        firstName
        lastName
        nickname
        fullName
        description
        pictureFile
        address
        apprentice
        graduationYear
        phone
        birthday
        cededImageRightsToTVn7
        links {
          name
          value
        }
        godparent {
          uid
          firstName
          lastName
          pictureFile
          fullName
        }
        godchildren {
          uid
          firstName
          lastName
          pictureFile
          fullName
        }
        outgoingGodparentRequests {
          id
          godparent {
            uid
            firstName
            lastName
            pictureFile
            fullName
          }
          createdAt
        }
        incomingGodparentRequests {
          id
          godchild {
            uid
            firstName
            lastName
            pictureFile
            fullName
          }
          createdAt
        }
        contributesTo {
          name
          id
        }
        contributesWith {
          name
          id
        }
        familyTree {
          users {
            uid
          }
        }
        minor {
          id
          name
          yearTier
          shortName
          uid
        }
        major {
          shortName
          uid
          id
          name
          minors {
            id
            name
            yearTier
            shortName
          }
          schools {
            name
            id
            studentAssociations {
              name
              id
            }
          }
        }
        enabledNotificationChannels
        canBeEdited
      }

      schoolGroups {
        names
        majors {
          id
          name
          minors {
            id
            name
            yearTier
          }
        }
      }

      contributionOptions {
        name
        id
      }

      me {
        uid
        admin
        credentials {
          id
          name
          type
          userAgent
          createdAt
          active
        }
        cededImageRightsToTVn7
        groups {
          group {
            uid
            name
            pictureFile
          }
          title
        }
      }

      userPermissions: user(uid: $uid) {
        admin
        canAccessDocuments
      }
    }
  `)
    .fetch({ event, variables: event.params })
    .then((d) => d.data);

  if (!result?.user) error(404, { message: 'Personne non trouvée' });
  return result;
}
