<script lang="ts">
  export let paid: boolean;
  export let pending = false;
  export let feminin = false;
  export let pendingTimeRemaining: string;
  import { PUBLIC_UNPAID_REGISTRATION_VALID_FOR_MINUTES } from '$env/static/public';
  import Badge from './Badge.svelte';
</script>

<Badge
  title={pending
    ? `Cette place est réservée pendant ${PUBLIC_UNPAID_REGISTRATION_VALID_FOR_MINUTES} minutes après sa réservation.`
    : paid
    ? 'Place réservée'
    : 'Place non réservée. Paye pour la réserver.'}
  class="payment-status"
  theme={paid ? 'success' : 'warning'}
  >{#if pending}En attente {#if pendingTimeRemaining}<span class="duration"
        >{pendingTimeRemaining}</span
      >{/if}
  {:else if paid}Payé{#if feminin}e{/if}{:else}Non payé{#if feminin}e{/if}{/if}</Badge
>

<style>
  .duration {
    margin-left: 0.5rem;
    font-family: var(--font-mono);
  }
</style>
