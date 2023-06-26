<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from '$lib/components/FormArticle.svelte';

  export let data: PageData;
</script>

<PostDetails bind:data />
