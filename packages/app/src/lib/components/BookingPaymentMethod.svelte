<script lang="ts">
  import { graphql, type BookingPaymentMethod } from '$houdini';
  import { DISPLAY_PAYMENT_METHODS, ICONS_PAYMENT_METHODS } from '$lib/display';
  import { loadingFragment, LoadingText } from '$lib/loading';

  export let booking: BookingPaymentMethod | null;
  $: data = loadingFragment(
    booking,
    graphql(`
      fragment BookingPaymentMethod on Registration @loading {
        paymentMethod
      }
    `),
  );
</script>

<div class="payment-method">
  {#if $data?.loaded()}
    <svelte:component this={ICONS_PAYMENT_METHODS[$data.v.paymentMethod]}></svelte:component>
    <span class="payment-method-name">{DISPLAY_PAYMENT_METHODS[$data.v.paymentMethod]}</span>
  {:else}
    <LoadingText />
  {/if}
</div>

<style>
  .payment-method {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }
</style>
