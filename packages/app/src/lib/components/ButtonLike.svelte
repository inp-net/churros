<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fragment, graphql, type ButtonLike } from '$houdini';
  import { loaded } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import { typenameOfId } from '$lib/typenames';
  import { NumberFlip } from 'number-flip-animation';
  import 'number-flip-animation/dist/styles.css';
  import IconHeartFilled from '~icons/msl/favorite';
  import IconHeartEmpty from '~icons/msl/favorite-outline';

  $: ({ RootLayout } = $page.data);

  export let resource: ButtonLike | null;
  $: data = fragment(
    resource,
    graphql(`
      fragment ButtonLike on Reactable @loading {
        __typename
        id
        likes: reactions(emoji: "❤️")
        liked: reacted(emoji: "❤️")
      }
    `),
  );

  async function toggle(id: string, like: boolean) {
    if (!$data || !loaded($data.likes)) return;
    const typename = typenameOfId(id);
    return graphql(`
      mutation ToggleLike($id: ID!, $like: Boolean!) {
        react(emoji: "❤️", target: $id) @include(if: $like) {
          __typename
          ...ButtonLike
        }
        unreact(emoji: "❤️", target: $id) @skip(if: $like) {
          __typename
          ...ButtonLike
        }
      }
    `).mutate(
      { id, like },
      {
        optimisticResponse: {
          [like ? 'react' : 'unreact']: {
            __typename: typename,
            id,
            likes: $data.likes + (like ? 1 : -1),
            liked: true,
          },
        },
      },
    );
  }

  let numbersElement: HTMLElement | null;
  let numbersAnimator: NumberFlip;

  $: if (browser && $data && loaded($data.likes) && numbersElement && !numbersAnimator) {
    numbersAnimator = new NumberFlip({
      rootElement: numbersElement,
      newNumber: $data.likes,
      durationFlip: 50,
      durationOpacity: 50,
    });
  }

  $: if ($data && loaded($data.likes))
    numbersAnimator?.setNumberTo({ newNumber: $data.likes, durationFlip: 50, durationOpacity: 25 });
</script>

<div class="button-like">
  <button
    disabled={!$RootLayout.data?.loggedIn}
    on:click={async () => {
      if (!$data) return;
      if (!loaded($data.id) || !loaded($data.liked)) return;
      const result = await toggle($data.id, !$data.liked);
      if (!result) return;
      if (result.errors) toasts.error(result.errors[0].message);
    }}
  >
    <div class="icon">
      {#if $data?.liked}
        <IconHeartFilled color="var(--danger)"></IconHeartFilled>
      {:else}
        <IconHeartEmpty></IconHeartEmpty>
      {/if}
    </div>
    <span class="number-flip" bind:this={numbersElement}>
      <!-- Keep content for SSR, but using this on CSR would prevent the animator from changing the text content first (too much reactivity haha) -->
      {#if !$data || !loaded($data.likes)}…{:else if !browser}{$data.likes}{/if}
    </span>
  </button>
</div>

<style>
  button {
    display: flex;
    flex-direction: var(--direction, row);
    gap: 0 0.5ch;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  /* button:active .icon {
    animation: pop-out 0.2s ease;
  }

  @keyframes pop-out {
    from {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    to {
        transform: scale(1);
    }
  } */
</style>
