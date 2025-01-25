<script lang="ts">
  import { fragment, graphql, type BookingBeneficiary } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import { LoadingText, allLoaded } from '$lib/loading';

  /** Whether to use the UIDs instead of the full names */
  export let shortName = false;
  $: nameProperty = (shortName ? 'uid' : 'fullName') as 'uid' | 'fullName';

  export let booking: BookingBeneficiary|null;
  $: data = fragment(
    booking,
    graphql(`
      fragment BookingBeneficiary on Registration @loading {
        beneficiary
        author {
          ...AvatarUser
          uid
          fullName
        }
        beneficiaryUser {
          ...AvatarUser
          uid
          fullName
        }
      }
    `),
  );
</script>

<div class="booking-beneficiary">
  {#if !$data || !allLoaded($data)}
    <LoadingText />
  {:else if $data.beneficiary}
    {$data.beneficiary}
  {:else if $data.beneficiaryUser || $data.author}
    <AvatarUser user={$data.beneficiaryUser ?? $data.author} />
    {$data.beneficiaryUser?.[nameProperty] ?? $data.author?.[nameProperty]}
  {:else}
    <span class="muted">Aucun compte lié</span>
  {/if}
</div>

<style>
  .booking-beneficiary {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
