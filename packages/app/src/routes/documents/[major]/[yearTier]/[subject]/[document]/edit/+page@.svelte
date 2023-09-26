<script lang="ts">
  import FormDocument from '$lib/components/FormDocument.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<FormDocument data={data.document}></FormDocument>
