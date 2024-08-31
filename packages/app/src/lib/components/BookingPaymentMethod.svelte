<script lang="ts">
  import { fragment, graphql, type BookingPaymentMethod } from '$houdini';
  import { DISPLAY_PAYMENT_METHODS, ICONS_PAYMENT_METHODS } from '$lib/display';
  import { loaded, LoadingText } from '$lib/loading';

  export let booking: BookingPaymentMethod | null;
  $: data = fragment(
    booking,
    graphql(`
      fragment BookingPaymentMethod on Registration {
        paymentMethod
      }
    `),
  );
</script>

<div class="payment-method">
  {#if $data && loaded($data.paymentMethod)}
    <svelte:component this={ICONS_PAYMENT_METHODS[$data.paymentMethod]}></svelte:component>
    <span class="payment-method-name">{DISPLAY_PAYMENT_METHODS[$data.paymentMethod]}</span>
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
