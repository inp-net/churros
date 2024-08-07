<script lang="ts">
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
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
