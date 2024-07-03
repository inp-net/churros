<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormAnnouncement from '$lib/components/FormAnnouncement.svelte';
</script>

<div class="content">
  <h1><ButtonBack /> Nouvelle annonce</h1>
  <FormAnnouncement announcement={null} />
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
