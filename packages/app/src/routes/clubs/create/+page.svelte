<script lang="ts">
  import ClubDetails from '$lib/../routes/club/[group]/edit/ClubDetails.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Création d'un groupe</h1>

<ClubDetails bind:data />
