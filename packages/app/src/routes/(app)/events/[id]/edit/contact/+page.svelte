<script lang="ts">
  import { InputText } from '$lib/components';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { ChangeEventContactDetails } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditContact } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEventEditContact} let:data={{ event }}>
  <div class="contents">
    <InputText
      on:blur={async ({ currentTarget }) => {
        if (!(currentTarget instanceof HTMLInputElement)) return;
        const result = await mutate(ChangeEventContactDetails, {
          event: event.id,
          contactMail: currentTarget.value,
        });
        toasts.mutation(
          result,
          'updateEvent',
          '',
          "Impossible de mettre à jour l'e-mail de contact",
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
