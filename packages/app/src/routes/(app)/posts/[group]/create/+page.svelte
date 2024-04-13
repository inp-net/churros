<script lang="ts">
  import type { PageData } from './$houdini';
  import FormArticle from '$lib/components/FormArticle.svelte';

  export let data: PageData;
  $: ({ CreateGroupPostPage } = data);
</script>

<div class="content">
  <h2>Nouveau post</h2>
  {#if $CreateGroupPostPage.data?.group}
    <FormArticle data={null} initialGroup={$CreateGroupPostPage.data.group} />
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  h2 {
    text-align: center;
  }
</style>
