<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql, type GroupType$options } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputUid from '$lib/components/InputUID.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';

  const CreateGroup = graphql(`
    mutation CreateGroup($name: String!, $uid: UID!, $type: GroupType!, $studentAssociation: UID!) {
      createGroup(name: $name, uid: $uid, type: $type, studentAssociation: $studentAssociation) {
        ...MutationErrors
        ... on MutationCreateGroupSuccess {
          data {
            uid
          }
        }
      }
    }
  `);

  /** The uid of the student association */
  export let studentAssociation: string | null;
  let errors: string[] = [];

  let name = '';
  let uid = '';
  let type: GroupType$options | undefined = undefined;
  let uidUnavailable = false;

  let open: () => void;
  let implicitClose: () => void;

  $: page.subscribe(({ state }) => {
    if (state.NAVTOP_CREATING_GROUP) open?.();
    else implicitClose?.();
  });
</script>

<ModalOrDrawer notrigger bind:open bind:implicitClose let:close>
  <h1 slot="header">Créer un nouveau groupe</h1>

  <form
    on:submit|preventDefault={async () => {
      if (!studentAssociation) {
        toasts.error(
          "Tu n'a pas les permissions pour créer un groupe",
          'Il faut être respo club ou admin sur au moins une AE',
        );
        return;
      }
      if (!type) return;
      const result = await CreateGroup.mutate({ name, uid, type, studentAssociation });
      if (mutationSucceeded('createGroup', result)) {
        close();
        await goto(route('/groups/[uid]/edit', result.data.createGroup.data.uid));
      } else {
        errors = mutationErrorMessages('createGroup', result);
      }
    }}
  >
    <InputText bind:value={name} label="Nom" />
    <InputUid bind:unavailable={uidUnavailable} bind:value={uid} label="Le @ du groupe"></InputUid>
    <InputSelectOne
      label="Type de groupe"
      required
      options={DISPLAY_GROUP_TYPES}
      bind:value={type}
    />
    <section class="submit">
      <ButtonSecondary
        on:click={() => {
          name = '';
          uid = '';
          type = undefined;
          close();
        }}>Annuler</ButtonSecondary
      >
      <ButtonPrimary disabled={uidUnavailable} submits>Créer</ButtonPrimary>
    </section>
    {#if errors.length}
      <Alert theme="danger">
        <p>Impossible de créer @{uid}</p>
        <ul>
          {#each errors as error}
            <li>{error}</li>
          {/each}
        </ul>
      </Alert>
    {/if}
  </form>
</ModalOrDrawer>

<style>
  section.submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }
</style>
