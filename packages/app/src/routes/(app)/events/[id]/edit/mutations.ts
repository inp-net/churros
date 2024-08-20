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
      ...MutationErrors
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
      ...MutationErrors
    }
  }
`);

export const ChangeEventDates = graphql(`
  mutation ChangeEventDates($event: LocalID!, $dates: DateRangeInput) {
    setEventDates(id: $event, dates: $dates) {
      __typename
      ... on MutationSetEventDatesSuccess {
        data {
          startsAt
          endsAt
        }
      }
      ...MutationErrors
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
      ...MutationErrors
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
      ...MutationErrors
    }
  }
`);

export const SetEventKioskModeInclusion = graphql(`
  mutation SetEventKioskModeInclusion($event: LocalID!, $includeInKiosk: Boolean!) {
    updateEvent(id: $event, includeInKiosk: $includeInKiosk) {
      __typename
      ... on MutationUpdateEventSuccess {
        data {
          includeInKiosk
        }
      }
      ...MutationErrors
    }
  }
`);

export const ChangeEventRecurrence = graphql(`
  mutation ChangeEventRecurrence(
    $event: LocalID!
    $frequency: EventFrequency!
    $recurringUntil: DateTime
  ) {
    updateEventRecurrence(id: $event, frequency: $frequency, recurringUntil: $recurringUntil) {
      __typename
      ... on MutationUpdateEventRecurrenceSuccess {
        data {
          frequency
          recurringUntil
        }
      }
      ...MutationErrors
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
      ...MutationErrors
    }
  }
`);

export const ChangeEventCoOrganizers = graphql(`
  mutation ChangeEventCoOrganizers($event: LocalID!, $coOrganizers: [UID!]!) {
    setEventCoOrganizers(id: $event, coOrganizers: $coOrganizers) {
      __typename
      ... on MutationSetEventCoOrganizersSuccess {
        data {
          coOrganizers {
            uid
            name
            ...AvatarGroup
          }
        }
      }
      ...MutationErrors
    }
  }
`);
