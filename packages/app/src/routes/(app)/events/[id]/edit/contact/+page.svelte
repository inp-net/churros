<script lang="ts">
  import { graphql } from '$houdini';
  import { InputText } from '$lib/components';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditContact } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEventEditContact} let:data={{ event }}>
  <div class="contents">
    <InputText
      on:blur={async () => {
        await graphql(`
          mutation ChangeEventContactDetails($event: LocalID!, $contactMail: String!) {
            updateEvent(event: $event, contactMail: $contactMail) {
              __typename
              ... on MutationUpdateEventSuccess {
                data {
                  id
                  contactMail
                }
              }
              ... on Error {
                message
              }
              ... on ZodError {
                fieldErrors {
                  path
                  message
                }
              }
            }
          }
        `);
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
