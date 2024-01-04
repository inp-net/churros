<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormService from '$lib/components/FormService.svelte';

  import type { PageData } from './$types';

  export let data: PageData;

  const { service } = data;
</script>

<div class="content">
  <h1><ButtonBack /> Ajout d'un service</h1>

  <FormService {service} />
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
