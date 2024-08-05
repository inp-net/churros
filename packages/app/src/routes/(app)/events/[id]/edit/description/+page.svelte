<script lang="ts">
  import { graphql } from '$houdini';
  import InputTextLong from '$lib/components/InputLongText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { loaded, LoadingText } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$houdini';

  const ChangeDescription = graphql(`
    mutation UpdateEventDescription($id: LocalID!, $description: Markdown!) {
      updateEvent(id: $id, description: $description) {
        __typename
        ... on MutationUpdateEventSuccess {
          data {
            id
            description
          }
        }
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            message
            path
          }
        }
      }
    }
  `);

  export let data: PageData;
  $: ({ PageEventEditDescription } = data);
</script>

<MaybeError result={$PageEventEditDescription} let:data={{ event }}>
  <div class="contents">
    {#if loaded(event.description)}
      <InputTextLong
        label="Description"
        rich
        value={event.description}
        on:blur={async ({ currentTarget }) => {
          if (!(currentTarget instanceof HTMLTextAreaElement)) return;
          const result = await mutate(ChangeDescription, {
            id: event.id,
            description: currentTarget.value,
          });
          toasts.mutation(result, 'updateEvent', '', 'Impossible de mettre à jour la description');
        }}
      ></InputTextLong>
    {:else}
      <LoadingText lines={5} />
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;

    --weight-field-label: 800;
  }
</style>
