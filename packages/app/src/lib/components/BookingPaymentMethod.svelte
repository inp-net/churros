<script lang="ts">
  import { fragment, graphql, type BookingPaymentMethod } from '$houdini';
  import { DISPLAY_PAYMENT_METHODS, ICONS_PAYMENT_METHODS } from '$lib/display';
  import { loaded, LoadingText, type MaybeLoading } from '$lib/loading';

  /** Text à afficher quand le moyen de paiement est null (par ex pour une place dont le moyen n'a pas encore été choisi, ou si la place était gratuite) */
  export let emptyText: MaybeLoading<string> = 'Non choisi';

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
    {#if $data.paymentMethod}
      <svelte:component this={ICONS_PAYMENT_METHODS[$data.paymentMethod]}></svelte:component>
      <span class="payment-method-name">{DISPLAY_PAYMENT_METHODS[$data.paymentMethod]}</span>
    {:else}
      <LoadingText class="muted" value={emptyText} />
    {/if}
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
