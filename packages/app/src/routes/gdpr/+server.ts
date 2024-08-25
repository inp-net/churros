import { json } from '@sveltejs/kit';
import { graphql } from 'graphql';

export async function GET(event) {
  const result = await graphql(`
    query GDPRUserDump {
      me {
        address
        admin
        adminOf {
          uid
        }
        answeredForms {
          nodes {
            id
          }
        }
        apprentice
        articles {
          nodes {
            id
            title
            group {
              uid
            }
          }
        }
        birthday
        boardMemberships {
          group {
            uid
          }
          canEditArticles
          treasurer
          secretary
          president
          vicePresident
          title
        }
        bookings {
          nodes {
            code
            ticket {
              name
              id
              event {
                id
                title
                group {
                  uid
                }
              }
            }
          }
        }
        bookmarks {
          id
          path
        }
        bot
        canAccessDocuments
        canBeEdited
        canManageAnnouncements
        cededImageRightsToTVn7
        contributesTo {
          uid
        }
        contributesWith {
          id
          name
        }
        contributionOptions {
          id
          name
        }
        createdAt
        description
        descriptionHtml
        email
        emailChangeRequests {
          id
          email
          createdAt
        }
        enabledNotificationChannels
        external
        familyTree {
          users {
            uid
          }
          nesting
        }
        firstName
        fullName
        godchildren {
          uid
        }
        godparent {
          uid
        }
        graduationYear
        groups {
          group {
            uid
          }
          title
          president
          vicePresident
          treasurer
          secretary
          canEditArticles
          canEditMembers
          canScanEvents
          isDeveloper
        }
        hasSeparateDarkPicture
        id
        incomingGodparentRequests {
          id
          createdAt
          godchild {
            uid
          }
          godparent {
            uid
          }
        }
        lastName
        latestVersionSeenInChangelog
        links {
          text
          url
          id
        }
        localID
        lydiaPhone
        major {
          uid
          id
        }
        managedEvents {
          event {
            id
            title
          }
          power
        }
        minor {
          name
        }
        nickname
        otherEmails
        outgoingGodparentRequests {
          id
          createdAt
          godchild {
            uid
          }
          godparent {
            uid
          }
        }
        partiallyAnsweredForms {
          nodes {
            id
          }
        }
        pendingContributions {
          id
          name
          price
        }
        phone
        pictureAltText
        pictureFile
        pictureFileDark
        pictureURL
        schoolEmail
        schoolUid
        uid
        yearTier
      }
    }
  `).fetch({ event });

  if (result.errors || !result.data?.me)
    {return new Response(result.errors?.map((e) => e.message).join('\n') ?? 'Erreur inconnue', {
      status: 500,
    });}

  return json(result.data?.me);
}
