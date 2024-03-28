<script lang="ts">
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import FormBasicDetails from '../FormBasicDetails.svelte';

  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="content">
  <h1>Créer un formulaire</h1>
  <FormBasicDetails availableGroups={data.me.boardMemberships.map((g) => g.group)}
  ></FormBasicDetails>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    row-gap: 1em;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
</style>
