<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { CreatePostStore, graphql } from '$houdini';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: ({ LayoutEventPage } = data);
</script>

<svelte:window
  on:NAVTOP_CREATE_POST_ON_EVENT={async () => {
    const result = await mutate(new CreatePostStore(), {
      event: $page.params.id,
      group: $LayoutEventPage.data?.event.organizer.uid,
    });
    if (toasts.mutation(result, 'upsertArticle', 'Post créé', 'Impossible de créer un post'))
      await goto(route('/posts/[id]/edit', result.data.upsertArticle.data.localID));
  }}
/>

<slot></slot>
