<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormGroup from '$lib/components/FormGroup.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="content">
  <h1><ButtonBack /> Création d'un groupe</h1>

  <FormGroup bind:data />
</div>

<style>
  .content {
    max-width: 600px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
