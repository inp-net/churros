<script lang="ts">
  import { fragment, graphql, type TextTicketConstraintsSummary } from '$houdini';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export let ticket: TextTicketConstraintsSummary | null;
  $: fragment(
    ticket,
    graphql(`
      fragment TextTicketConstraintsSummary on Ticket {
        openToAlumni
        openToApprentices
        openToContributors
        openToExternal
        openToGroups {
          uid
        }
        openToMajors {
          uid
        }
        openToPromotions
      }
    `),
  );
</script>
