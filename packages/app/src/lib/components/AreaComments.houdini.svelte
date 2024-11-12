<script lang="ts">
  import { CardCommentMeStore, fragment, graphql, type AreaComments } from '$houdini';
  import CardComment from '$lib/components/CardCommentV2.svelte';
  import { loading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { infinitescroll } from '$lib/scroll';
  import ButtonSecondary from './ButtonSecondary.svelte';

  export let me;
  $: dataMe = fragment(me, new CardCommentMeStore());

  export let comments: AreaComments | null;
  $: data = fragment(
    comments,
    graphql(`
      fragment AreaComments on Commentable @loading {
        id
        canComment
        comments(first: 30) @loading(count: 5) {
          nodes @list(name: "List_AreaComments") {
            ...CardComment
          }
        }
      }
    `),
  );
</script>

{#if $data?.canComment}
  <CardComment comment={null} composeOn={loading($data?.id, undefined)} me={$dataMe} />
{:else}
  <small class="login-to-comment">
    <ButtonSecondary noClientSideNavigation href={refroute('/login')} insideProse
      >Connectez-vous</ButtonSecondary
    > pour commenter.
  </small>
{/if}

<ul class="comments">
  {#each $data?.comments?.nodes ?? [] as comment}
    <li>
      <CardComment me={$dataMe} {comment} />
    </li>
  {/each}
</ul>

<style>
  .comments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
