<script lang="ts">
  import { page } from '$app/stores';
  import FormArticle from '$lib/components/FormArticle.houdini.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PagePostEdit } = data);
</script>

<div class="content">
  <MaybeError result={$PagePostEdit} let:data={{ article, groups }}>
    <FormPicture rectangular objectName="Article" object={article} />
    <FormArticle preselectedGroup={$page.params.group} {groups} {article} />
  </MaybeError>
</div>

<style>
  .content {
    max-width: 1000px;
    margin: 0 auto;
  }
</style>
