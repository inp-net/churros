<script lang="ts">
  import FormGroup from '$lib/components/FormGroup.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Création d'un groupe</h1>

<FormGroup bind:data />
