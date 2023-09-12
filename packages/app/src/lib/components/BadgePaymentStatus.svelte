<script lang="ts">
  export let paid: boolean;
  export let cancelled: boolean;
  export let opposed: boolean;
  export let feminin = false;
  import Badge from './Badge.svelte';
</script>

<Badge class="payment-status" theme={opposed || cancelled ? 'danger' : paid ? 'success' : 'warning'}
  >{#if opposed}En opposition{:else if cancelled}Annulé{#if feminin}e{/if}{:else if paid}Payé{#if feminin}e{/if}{:else}Non
    payé{#if feminin}e{/if}{/if}</Badge
>
