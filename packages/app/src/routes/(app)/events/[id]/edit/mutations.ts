import { graphql } from '$houdini';

export const ChangeEventOrganizer = graphql(`
  mutation ChangeEventOrganizer($event: LocalID!, $group: UID!) {
    changeEventOrganizer(group: $group, id: $event) {
      __typename
      ... on MutationChangeEventOrganizerSuccess {
        data {
          organizer {
            uid
            name
            ...AvatarGroup
          }
        }
      }
      ... on Error {
        message
      }
      ... on ZodError {
        fieldErrors {
          message
          path
        }
      }
    }
  }
`);

export const ChangeEventTitle = graphql(`
  mutation ChangeEventTitle($event: LocalID!, $title: String!) {
    updateEvent(id: $event, title: $title) {
      __typename
      ... on MutationUpdateEventSuccess {
        data {
          title
        }
      }
      ... on Error {
        message
      }
      ... on ZodError {
        fieldErrors {
          message
          path
        }
      }
    }
  }
`);

export const ChangeEventDates = graphql(`
  mutation ChangeEventDates($event: LocalID!, $startsAt: DateTime!, $endsAt: DateTime!) {
    updateEvent(id: $event, dates: { start: $startsAt, end: $endsAt }) {
      __typename
      ... on MutationUpdateEventSuccess {
        data {
          startsAt
          endsAt
        }
      }
      ... on Error {
        message
      }
      ... on ZodError {
        fieldErrors {
          message
          path
        }
      }
    }
  }
`);

export const ChangeEventLocation = graphql(`
  mutation ChangeEventLocation($event: LocalID!, $location: String!) {
    updateEvent(id: $event, location: $location) {
      __typename
      ... on MutationUpdateEventSuccess {
        data {
          location
        }
      }
      ... on Error {
        message
      }
      ... on ZodError {
        fieldErrors {
          message
          path
        }
      }
    }
  }
`);

export const ChangeEventVisibility = graphql(`
  mutation ChangeEventVisibility($event: LocalID!, $visibility: Visibility!) {
    setEventVisibility(id: $event, visibility: $visibility) {
      __typename
      ... on MutationSetEventVisibilitySuccess {
        data {
          visibility
          includeInKiosk
        }
      }
      ... on Error {
        message
      }
      ... on ZodError {
        fieldErrors {
          message
          path
        }
      }
    }
  }
`);

export const DeleteEvent = graphql(`
  mutation DeleteEvent($event: LocalID!) {
    deleteEvent(id: $event) {
      __typename
      ... on MutationDeleteEventSuccess {
        didSoftDelete
        data {
          id
          visibility
          includeInKiosk
        }
      }
      ... on Error {
        message
      }
    }
  }
`);
