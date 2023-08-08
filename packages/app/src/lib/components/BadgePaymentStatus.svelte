<script lang="ts">
  export let paid: boolean;
  export let feminin = false;
  import Badge from './Badge.svelte';
</script>

<Badge class="payment-status" theme={paid ? 'success' : 'warning'}
  >{#if paid}Payé{#if feminin}e{/if}{:else}Non payé{#if feminin}e{/if}{/if}</Badge
>
