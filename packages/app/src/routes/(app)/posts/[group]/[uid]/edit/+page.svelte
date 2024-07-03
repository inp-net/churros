<script lang="ts">
  import FormArticle from '$lib/components/FormArticle.houdini.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PagePostEdit } = data);
</script>

<div class="content">
  <MaybeError result={$PagePostEdit} let:data={{ article, me }}>
    <FormPicture rectangular objectName="Article" object={article} />
    <FormArticle
      {article}
      groups={me.canCreatePostsOn}
      selectedGroup={me.canCreatePostsOn.find((g) => g.uid === article.group.uid)}
    />
  </MaybeError>
</div>

<style>
  .content {
    max-width: 1000px;
    margin: 0 auto;
  }
</style>
