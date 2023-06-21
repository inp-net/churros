<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from '../post/[post]/edit/PostDetails.svelte';
  import PostPicture from '../post/[post]/edit/PostPicture.svelte';

  export let data: PageData;
</script>

<PostDetails bind:data />
