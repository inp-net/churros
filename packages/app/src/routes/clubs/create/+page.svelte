<script lang="ts">
  import ClubDetails from '$lib/../routes/club/[group]/edit/ClubDetails.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Création d'un groupe</h1>

<!-- <ClubPicture bind:club={data.group} /> -->
<ClubDetails bind:data />

<style lang="scss">
  input,
  select {
    display: block;
    width: 100%;
  }

  .oneline {
    input {
      display: inline-block;
      width: unset;
    }
  }
</style>
