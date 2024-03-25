<script lang="ts">
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import FormBasicDetails from '../FormBasicDetails.svelte';

  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Créer un formulaire</h1>
<FormBasicDetails availableGroups={data.me.boardMemberships.map((g) => g.group)}></FormBasicDetails>
