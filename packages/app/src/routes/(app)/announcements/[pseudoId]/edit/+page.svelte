<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormAnnouncement from '$lib/components/FormAnnouncement.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="content">
  <h1><ButtonBack /> Modifier une annonce</h1>
  <FormAnnouncement bind:data={data.announcement} />
</div>

<style>
  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .content {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
