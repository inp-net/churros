<script lang="ts">
  import type { PageData } from './$types';
  import FormGroup from '$lib/components/FormGroup.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';

  export let data: PageData;

  $: ({ group, lydiaAccountsOfGroup } = data);
</script>

<div class="forms">
  <FormPicture objectName="Group" bind:object={group} />
  <FormGroup bind:data />
</div>

<style>
  .forms {
    display: flex;
    flex-flow: column wrap;
    gap: 3rem;
  }
</style>
