import { graphql } from '$houdini';

export const UpdateName = graphql(`
  mutation UpdateTicketName($ticket: LocalID!, $name: String!) {
    updateTicket(ticket: $ticket, name: $name) {
      ... on MutationUpdateTicketSuccess {
        data {
          name
        }
      }
      ...MutationErrors
    }
  }
`);

export const UpdateShotgunDates = graphql(`
  mutation UpdateTicketShotgunDates($ticket: LocalID!, $shotgun: DateRangeInput!) {
    updateTicket(ticket: $ticket, shotgun: $shotgun) {
      ... on MutationUpdateTicketSuccess {
        data {
          opensAt
          closesAt
        }
      }
      ...MutationErrors
    }
  }
`);

export const UpdatePrice = graphql(`
  mutation UpdateTicketPrice($ticket: LocalID!, $price: Float!) {
    updateTicket(ticket: $ticket, price: $price) {
      ... on MutationUpdateTicketSuccess {
        data {
          basePrice
        }
      }
      ...MutationErrors
    }
  }
`);

export const UpdateCapacity = graphql(`
  mutation UpdateTicketCapacity($ticket: LocalID!, $capacity: Capacity!) {
    updateTicket(ticket: $ticket, capacity: $capacity) {
      ... on MutationUpdateTicketSuccess {
        data {
          capacity
        }
      }
      ...MutationErrors
    }
  }
`);

export const UpdateGodsonLimit = graphql(`
  mutation UpdateTicketGodsonLimit($ticket: LocalID!, $godsonLimit: Int!) {
    updateTicket(ticket: $ticket, godsonLimit: $godsonLimit) {
      ... on MutationUpdateTicketSuccess {
        data {
          godsonLimit
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToContributors = graphql(`
  mutation ChangeTicketStudentAssociationContributorsConstraint(
    $ticket: LocalID!
    $constraint: BooleanConstraint!
  ) {
    updateTicketConstraints(
      ticket: $ticket
      constraints: { studentAssociationContributors: $constraint }
    ) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          openToContributors
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToExternal = graphql(`
  mutation ChangeTicketExternalsConstraint($ticket: LocalID!, $constraint: BooleanConstraint!) {
    updateTicketConstraints(ticket: $ticket, constraints: { external: $constraint }) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          openToExternal
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToAlumni = graphql(`
  mutation ChangeTicketAlumniConstraint($ticket: LocalID!, $constraint: BooleanConstraint!) {
    updateTicketConstraints(ticket: $ticket, constraints: { alumni: $constraint }) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          openToAlumni
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToApprentices = graphql(`
  mutation ChangeTicketApprenticesConstraint($ticket: LocalID!, $constraint: BooleanConstraint!) {
    updateTicketConstraints(ticket: $ticket, constraints: { apprentices: $constraint }) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          openToApprentices
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToManagers = graphql(`
  mutation ChangeTicketManagersOnlyConstraint($ticket: LocalID!, $activated: Boolean!) {
    updateTicketConstraints(ticket: $ticket, constraints: { managersOnly: $activated }) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          onlyManagersCanProvide
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToMajors = graphql(`
  mutation ChangeTicketMajorsConstraint($ticket: LocalID!, $majors: [UID!]!) {
    updateTicketConstraints(ticket: $ticket, constraints: { majors: $majors }) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          openToMajors {
            uid
            name
          }
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToPromotions = graphql(`
  mutation ChangeTicketPromotionsConstraint($ticket: LocalID!, $promotions: [Int!]!) {
    updateTicketConstraints(ticket: $ticket, constraints: { promotions: $promotions }) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          openToPromotions
        }
      }
      ...MutationErrors
    }
  }
`);

export const LimitToGroupMembers = graphql(`
  mutation ChangeTicketGroupMembersConstraint($ticket: LocalID!, $groupMembers: [UID!]!) {
    updateTicketConstraints(ticket: $ticket, constraints: { groupMembers: $groupMembers }) {
      ... on MutationUpdateTicketConstraintsSuccess {
        data {
          openToGroups {
            ...PickGroup
            ...AvatarGroup
            uid
          }
        }
      }
      ...MutationErrors
    }
  }
`);

export const DeleteTicket = graphql(`
  mutation DeleteTicket($ticket: LocalID!) {
    deleteTicket(id: $ticket) {
      ... on MutationDeleteTicketSuccess {
        softDeleted
        data {
          onlyManagersCanProvide
        }
      }
      ...MutationErrors
    }
  }
`);

export const UpdateAllowedPaymentMethods = graphql(`
  mutation UpdateTicketAllowedPaymentMethods($ticket: LocalID!, $paymentMethod: [PaymentMethod!]!) {
    updateTicket(ticket: $ticket, allowedPaymentMethods: $paymentMethod) {
      ... on MutationUpdateTicketSuccess {
        data {
          allowedPaymentMethods
        }
      }
      ...MutationErrors
    }
  }
`);
