<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { mutateAndToast } from '$lib/mutations';
  import { ChangeLinkedEvent, UnlinkEvent } from '../mutations';
  import type { PageData } from './$houdini';
  import EventSelectList from './EventSelectList.svelte';

  export let data: PageData;
  $: ({ PagePostEditLinkedEvent } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons

  graphql(`
    fragment PagePostEditLinkedEvent_Event on Event @loading {
      id
      title
      location
      ...TextEventDates
    }
  `);

  const Search = graphql(`
    query PagePostEditLinkedEvent_SearchEvent($q: String!) {
      searchEvents(q: $q) {
        event {
          ...PagePostEditLinkedEvent_Event @mask_disable
        }
        highlightedTitle
      }
    }
  `);

  let q = '';
</script>

<MaybeError result={$PagePostEditLinkedEvent} let:data={{ post }}>
  {@const { events } = post.group}
  <div class="contents">
    <search>
      <InputSearchQuery
        bind:q
        on:debouncedInput={async ({ detail }) => {
          if (detail) await Search.fetch({ variables: { q: detail } });
        }}
      />
    </search>
    <section class="unlink">
      <ButtonSecondary
        disabled={!post.event}
        danger
        on:click={async () => {
          await mutateAndToast(UnlinkEvent, { post: $page.params.id });
        }}>Supprimer le lien</ButtonSecondary
      >
    </section>
    {#if q}
      <MaybeError result={$Search} let:data={{ searchEvents }}>
        <EventSelectList
          on:select={async ({ detail }) => {
            mutateAndToast(ChangeLinkedEvent, {
              post: $page.params.id,
              event: detail,
            });
          }}
          current={post.event}
          events={searchEvents.map((result) => ({
            ...result.event,
            title: result.highlightedTitle,
          }))}
        />
      </MaybeError>
    {:else}
      <EventSelectList
        on:select={async ({ detail }) => {
          await mutateAndToast(ChangeLinkedEvent, {
            post: $page.params.id,
            event: detail,
          });
        }}
        current={post.event}
        events={events.nodes}
      />
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .unlink {
    display: flex;
    justify-content: center;
  }
</style>
