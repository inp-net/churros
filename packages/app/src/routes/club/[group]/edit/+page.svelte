<script lang="ts">
  import type { PageData } from './$types';
  import FormGroup from '$lib/components/FormGroup.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';

  export let data: PageData;

  $: ({ group, lydiaAccountsOfGroup } = data);
</script>

<div class="forms">
  <div class="logos">
    <FormPicture objectName="Group" bind:object={group} />
    <FormPicture objectName="Group" bind:object={group} dark />
  </div>
  <FormGroup bind:data />
</div>

<style>
  .forms {
    display: flex;
    flex-flow: column wrap;
    gap: 3rem;
  }

  .logos {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
</style>
