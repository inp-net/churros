<script lang="ts">
  import FormArticle from '$lib/components/FormArticle.houdini.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { loaded, type MaybeLoading } from '$lib/loading';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PagePostEdit } = data);

  function groupIsLoaded<T extends { id: MaybeLoading<string> }>(
    group: T,
  ): group is T & { id: string } {
    return loaded(group.id);
  }
</script>

<div class="content">
  <MaybeError result={$PagePostEdit} let:data={{ article, me }}>
    <FormArticle
      {article}
      groups={me.canCreatePostsOn.filter(groupIsLoaded)}
      selectedGroup={me.canCreatePostsOn
        .filter(groupIsLoaded)
        .find((g) => g.uid === article.group.uid)}
    />
  </MaybeError>
</div>
