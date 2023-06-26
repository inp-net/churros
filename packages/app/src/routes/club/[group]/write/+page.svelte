<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from '../post/[post]/edit/PostDetails.svelte';

  export let data: PageData;
</script>

<PostDetails bind:data />
