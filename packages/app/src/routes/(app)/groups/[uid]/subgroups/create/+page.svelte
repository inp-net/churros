<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormGroup from '$lib/components/FormGroup.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="content">
  <h1><ButtonBack /> Création d'un sous-groupe de {data.group.parent.name}</h1>

  <FormGroup creatingSubgroup bind:data />
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
    margin-bottom: 2rem;
  }
</style>
