<script lang="ts">
  import { fragment, graphql, PendingValue, type BookingStatus } from '$houdini';
  import { allLoaded, mapAllLoading, LoadingText } from '$lib/loading';
  import IconPaid from '~icons/msl/check';
  import IconCancelled from '~icons/msl/close';
  import IconOpposed from '~icons/msl/do-not-disturb-on-outline';
  import IconVerified from '~icons/msl/done-all';
  import IconWaitingForPayment from '~icons/msl/more-horiz';

  export let booking: BookingStatus | null;
  $: data = fragment(
    booking,
    graphql(`
      fragment BookingStatus on Registration {
        opposed
        verified
        cancelled
        paid
      }
    `),
  );
</script>

<div
  class="booking-status {$data?.opposed
    ? 'danger'
    : $data?.cancelled
      ? 'warning'
      : $data?.paid
        ? 'success'
        : 'warning'}"
>
  <div class="icon-booking-status">
    {#if !allLoaded($data) || !$data}
      <LoadingText>..</LoadingText>
    {:else if $data.opposed}
      <IconOpposed />
    {:else if $data.verified}
      <IconVerified />
    {:else if $data.cancelled}
      <IconCancelled />
    {:else if $data.paid}
      <IconPaid />
    {:else}
      <IconWaitingForPayment />
    {/if}
  </div>

  <LoadingText
    value={$data
      ? mapAllLoading(
          [$data.opposed, $data.verified, $data.cancelled, $data.paid],
          (opposed, verified, cancelled, paid) => {
            if (opposed) return 'En opposition';
            if (verified) return 'Scannée';
            if (cancelled) return 'Annulée';
            if (paid) return 'Payée';
            return 'En attente de paiement';
          },
        )
      : PendingValue}
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
