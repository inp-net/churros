import { graphql } from '$houdini';

export const SetEventPlacesVisibility = graphql(`
  mutation SetEventPlacesVisibility(
    $id: LocalID!
    $showRemainingPlaces: Boolean!
    $showCapacity: Boolean!
  ) {
    updateEvent(id: $id, showPlacesLeft: $showRemainingPlaces, showCapacity: $showCapacity) {
      ... on MutationUpdateEventSuccess {
        data {
          showPlacesLeft
          showCapacity
        }
      }
      ...MutationErrors
    }
  }
`);

export const ChangeCapacity = graphql(`
  mutation ChangeEventGlobalCapacity($id: LocalID!, $capacity: Capacity!) {
    updateEvent(id: $id, globalCapacity: $capacity) {
      ... on MutationUpdateEventSuccess {
        data {
          globalCapacity
        }
      }
      ...MutationErrors
    }
  }
`);

export const SetEventBeneficiary = graphql(`
  mutation SetEventBeneficiary($id: LocalID!, $beneficiary: LocalID!) {
    setEventBeneficiary(event: $id, lydiaAccount: $beneficiary) {
      ... on MutationSetEventBeneficiarySuccess {
        data {
          beneficiary {
            id
            name
            ...PickBeneficiary
          }
        }
      }
      ...MutationErrors
    }
  }
`);

export const CreateTicket = graphql(`
  mutation CreateTicket($event: LocalID!, $shotgun: DateRangeInput!) {
    createTicket(event: $event, shotgun: $shotgun) {
      ... on MutationCreateTicketSuccess {
        data {
          id
          localID
          event {
            localID
            tickets {
              id
            }
          }
        }
      }
      ...MutationErrors
    }
  }
`);

export const UnsetEventBeneficiary = graphql(`
  mutation UnsetEventBeneficiary($id: LocalID!) {
    setEventBeneficiary(event: $id, lydiaAccount: null) {
      ... on MutationSetEventBeneficiarySuccess {
        data {
          beneficiary {
            id
            name
            ...PickBeneficiary
          }
        }
      }
      ...MutationErrors
    }
  }
`);

export const CreateTicketGroup = graphql(`
  mutation CreateTicketGroup($event: LocalID!) {
    upsertTicketGroup(event: $event, name: "", capacity: 0) {
      ...MutationErrors
      ... on MutationUpsertTicketGroupSuccess {
        data {
          localID
          event {
            localID
          }
        }
      }
    }
  }
`);

export const DeleteTicketGroup = graphql(`
  mutation DeleteTicketGroup($id: LocalID!) {
    deleteTicketGroup(id: $id) {
      ...MutationErrors
      ... on MutationDeleteTicketGroupSuccess {
        data {
          id
        }
      }
    }
  }
`);
