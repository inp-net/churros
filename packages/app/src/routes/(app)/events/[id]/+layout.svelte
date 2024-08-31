<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: ({ LayoutEventPage } = data);

  const CreatePost = graphql(`
    mutation CreatePostOnEvent($event: LocalID!, $group: UID!) {
      createPost(body: "", title: "", event: $event, group: $group) {
        ...MutationErrors
        ... on MutationCreatePostSuccess {
          data {
            localID
          }
        }
      }
    }
  `);
</script>

<svelte:window
  on:NAVTOP_CREATE_POST_ON_EVENT={async () => {
    const result = await mutate(CreatePost, {
      event: $page.params.id,
      group: $LayoutEventPage.data?.event.organizer.uid,
    });
    if (toasts.mutation(result, 'createPost', 'Post créé', 'Impossible de créer un post')) 
      await goto(route('/posts/[id]/edit', result.data.createPost.data.localID));
    
  }}
/>

<slot></slot>
