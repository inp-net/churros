<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  onMount(async () => {
    if (data.fullpageReload || /^https?:\/\//.test(data.next)) window.location.href = data.next;
    else await goto(data.next);
  });
</script>
