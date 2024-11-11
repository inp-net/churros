<script lang="ts">
  import { graphql, type BookingStatus } from '$houdini';
  import LoadingTextNew from '$lib/components/LoadingTextNew.svelte';
  import { loadingFragment, LoadingText } from '$lib/loading';
  import IconPaid from '~icons/msl/check';
  import IconCancelled from '~icons/msl/close';
  import IconOpposed from '~icons/msl/do-not-disturb-on-outline';
  import IconVerified from '~icons/msl/done-all';
  import IconWaitingForPayment from '~icons/msl/more-horiz';

  export let booking: BookingStatus | null;
  $: data = loadingFragment(
    booking,
    graphql(`
      fragment BookingStatus on Registration @loading {
        opposed
        verified
        cancelled
        paid
      }
    `),
  );
</script>

<div
  class="booking-status {$data?.then(({ opposed, verified, cancelled, paid }) => {
    if (opposed) return 'danger';
    if (verified) return 'primary';
    if (cancelled) return 'warning';
    if (paid) return 'success';
  }) ?? 'warning'}"
>
  <div class="icon-booking-status">
    {#if !$data?.loaded()}
      <LoadingText>..</LoadingText>
    {:else if $data.v.opposed}
      <IconOpposed />
    {:else if $data.v.verified}
      <IconVerified />
    {:else if $data.v.cancelled}
      <IconCancelled />
    {:else if $data.v.paid}
      <IconPaid />
    {:else}
      <IconWaitingForPayment />
    {/if}
  </div>

  <LoadingTextNew
    value={$data?.map(({ opposed, verified, cancelled, paid }) => {
      if (opposed) return 'En opposition';
      if (verified) return 'Scannée';
      if (cancelled) return 'Annulée';
      if (paid) return 'Payée';
      return 'En attente de paiement';
    })}
  />
</div>

<style>
  .icon-booking-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    font-size: 1.5em;
  }

  .booking-status {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
