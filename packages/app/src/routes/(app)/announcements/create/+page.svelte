<script lang="ts">
  import FormAnnouncement from '$lib/components/FormAnnouncement.svelte';
  import { addDays } from 'date-fns';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  let newAnnouncement = {
    title: '',
    body: '',
    startsAt: new Date(),
    endsAt: addDays(new Date(), 1),
    warning: false,
    id: '',
  };
</script>

<div class="content">
  <h1><ButtonBack /> Nouvelle annonce</h1>
  <FormAnnouncement bind:data={newAnnouncement} />
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
