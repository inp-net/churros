<!-- TODO integrate otherEmails as mailto: links, instead of having this separate thing -->
<script lang="ts">
  import { page } from '$app/stores';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { onceAllLoaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { UpdateUserOtherEmails } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageUserEditOtherEmails } = data);
</script>

<MaybeError result={$PageUserEditOtherEmails} let:data={{ user }}>
  <div class="contents">
    <InputLongText
      label="Autres adresses email (une par ligne)"
      on:blur={async ({ currentTarget }) => {
        if (!(currentTarget instanceof HTMLTextAreaElement)) return;
        const result = await mutate(UpdateUserOtherEmails, {
          uid: $page.params.uid,
          emails: currentTarget.value.split('\r\n'),
        });
        toasts.mutation(
          result,
          'updateUserProfile',
          '',
          'Impossible de mettre à jour les adresses email',
        );
      }}
      value={onceAllLoaded(
        user.otherEmails ?? [],
        (...emails) => emails.join('\r\n'),
        'Chargement…',
      )}
    ></InputLongText>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
