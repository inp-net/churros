<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconCheck from '~icons/mdi/pencil';
  import IconGear from '~icons/mdi/gear';
  import IconDelete from '~icons/mdi/delete';
</script>

<h1>Button <ButtonSecondary icon={IconGear}>Manage</ButtonSecondary></h1>
<div class="row">
  <ButtonSecondary>Some text</ButtonSecondary>

  <ButtonSecondary icon={IconCheck}>Some text with an icon</ButtonSecondary>
  <ButtonSecondary icon={IconDelete} danger>Delete forever (a long time!)</ButtonSecondary>
</div>

<style>
  .row {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
</style>
