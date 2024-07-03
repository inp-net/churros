<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import FormAnnouncement from '$lib/components/FormAnnouncement.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageAnnouncementEdit } = data);
</script>

<div class="content">
  <h1><ButtonBack /> Modifier une annonce</h1>
  <MaybeError result={$PageAnnouncementEdit} let:data={{ announcement }}>
    <FormAnnouncement {announcement} />
  </MaybeError>
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
