<script lang="ts">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { ORDER_REACTIONS } from '$lib/display';
  import { zeus } from '$lib/zeus';

  export let connection: { eventId: string } | { commentId: string } | { articleId: string };

  export let myReactions: Record<string, boolean>;
  export let reactionCounts: Record<string, number>;
</script>

<ul class="nobullet">
  {#each ORDER_REACTIONS as reaction}
    <li class:highlighted={myReactions[reaction]}>
      <ButtonGhost
        on:click={async () => {
          if (myReactions[reaction]) {
            reactionCounts[reaction]--;
            myReactions[reaction] = false;
            const { deleteReaction } = await $zeus.mutate({
              deleteReaction: [
                {
                  emoji: reaction,
                  ...connection,
                },
                true,
              ],
            });
            reactionCounts[reaction] += deleteReaction ? 0 : 1;
            myReactions[reaction] = !deleteReaction;
          } else {
            reactionCounts[reaction] = (reactionCounts[reaction] ?? 0) + 1;
            myReactions[reaction] = true;
            const { upsertReaction } = await $zeus.mutate({
              upsertReaction: [
                {
                  emoji: reaction,
                  ...connection,
                },
                true,
              ],
            });
            reactionCounts[reaction] = upsertReaction;
            myReactions[reaction] = true;
          }
        }}
      >
        {reaction}
        <span class="count">{reactionCounts[reaction] ?? 0} </span>
      </ButtonGhost>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  li.highlighted :global(.button-ghost) {
    color: var(--primary-bg);
    background: #9ce0ff !important;
  }

  li :global(.button-ghost) {
    padding: 0.25em 0.5em;
  }

  .count {
    margin-left: 0.5em;
    font-family: var(--font-mono);
  }
</style>
