<script lang="ts">
  import { graphql } from '$houdini';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditContact } = data);

  const EditContactEmail = graphql(`
    mutation ChangeEventContactDetails($event: LocalID!, $contactMail: String!) {
      updateEvent(id: $event, contactMail: $contactMail) {
        __typename
        ... on MutationUpdateEventSuccess {
          data {
            id
            contactMail
          }
        }
        ...MutationErrors
      }
    }
  `);
</script>

<MaybeError result={$PageEventEditContact} let:data={{ event }}>
  <div class="contents">
    <InputText
      on:blur={async () => {
        toasts.mutation(
          await mutate(EditContactEmail, {
            event: event.id,
            contactMail: event.contactMail,
          }),
          'updateEvent',
          '',
          "Impossible de modifier les infos de contact de l'orga",
        );
      }}
      value={event.contactMail}
      label="Contact de l'orga"
    ></InputText>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
