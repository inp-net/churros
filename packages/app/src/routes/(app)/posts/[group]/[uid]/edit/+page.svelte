<script lang="ts">
  import type { PageData } from './$types';
  import PostDetails from '$lib/components/FormArticle.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';

  export let data: PageData;
</script>

<div class="content">
  <FormPicture rectangular objectName="Article" bind:object={data.article} />
  <PostDetails bind:data />
</div>

<style>
  .content {
    max-width: 1000px;
    margin: 0 auto;
  }
</style>
