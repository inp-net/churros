<script lang="ts">
  import type { PageData } from './$houdini';
  import FormArticle from '$lib/components/FormArticle.houdini.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';

  export let data: PageData;
  $: ({ PagePostEdit } = data);
</script>

<div class="content">
  {#if $PagePostEdit.data}
    <FormPicture rectangular objectName="Article" object={$PagePostEdit.data.article} />
    <FormArticle article={$PagePostEdit.data.article} />
  {/if}
</div>

<style>
  .content {
    max-width: 1000px;
    margin: 0 auto;
  }
</style>
