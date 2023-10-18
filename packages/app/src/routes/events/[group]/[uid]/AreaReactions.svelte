<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { ORDER_REACTIONS } from '$lib/display';
  import { zeus } from '$lib/zeus';

  export let connection: { eventId: string } | { commentId: string } | { articleId: string };

  export let myReactions: Record<string, boolean>;
  export let reactionCounts: Record<string, number>;
</script>

<ul class="nobullet">
  {#each ORDER_REACTIONS as reaction}
    <li>
      <ButtonSecondary
        highlighted={myReactions[reaction]}
        on:click={async () => {
          if (myReactions[reaction]) {
            const { deleteReaction } = await $zeus.mutate({
              deleteReaction: [
                {
                  emoji: reaction,
                  ...connection,
                },
                true,
              ],
            });
            if (deleteReaction) {
              reactionCounts[reaction]--;
              myReactions[reaction] = false;
            }
          } else {
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
        >{reaction}
        <span class="count">{reactionCounts[reaction] ?? 0}</span>
      </ButtonSecondary>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .count {
    font-family: var(--font-mono);
  }
</style>
