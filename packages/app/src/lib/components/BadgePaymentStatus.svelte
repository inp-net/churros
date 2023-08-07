<script lang="ts">
  export let paid: boolean;
  import Badge from './Badge.svelte';
</script>

<Badge class="payment-status" theme={paid ? 'success' : 'warning'}
  >{#if paid}Payé{:else}Non payé{/if}</Badge
>
