<script lang="ts">
  import type { PageData } from './$houdini';
  import FormArticle from '$lib/components/FormArticle.houdini.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { page } from '$app/stores';

  export let data: PageData;
  $: ({ PagePostCreateWithGroup } = data);
</script>

<div class="content">
  <h2>Nouveau post</h2>
  <MaybeError result={$PagePostCreateWithGroup} let:data={{ me }}>
    <FormArticle
      groups={me.canCreatePostsOn}
      article={null}
      selectedGroup={me.canCreatePostsOn.find((g) => g.uid === $page.params.group) ?? null}
    />
  </MaybeError>
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
