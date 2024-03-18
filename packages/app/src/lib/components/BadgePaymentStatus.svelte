<script lang="ts">
  export let paid: boolean;
  export let cancelled: boolean;
  export let opposed: boolean;
  export let verified: boolean = false;
  export let feminin = false;
  import Badge from './Badge.svelte';
  import IconDoubleCheck from '~icons/mdi/check-all';

  $: ending = feminin ? 'e' : '';

  $: word = opposed
    ? `En opposition`
    : cancelled
      ? `Annulé${ending}`
      : verified
        ? `Scanné${ending}`
        : paid
          ? `Payé${ending}`
          : `Non payé${ending}`;
</script>

<Badge
  class="payment-status"
  theme={opposed || cancelled ? 'danger' : paid || verified ? 'success' : 'warning'}
  icon={verified && !opposed && !cancelled ? IconDoubleCheck : undefined}
>
  {word}</Badge
>
