<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql, type GroupType$options } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputUid from '$lib/components/InputUID.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';

  const CreateGroup = graphql(`
    mutation CreateGroup($name: String!, $uid: UID!, $type: GroupType!, $studentAssociation: UID) {
      upsertGroup(
        uid: null
        input: {
          name: $name
          uid: $uid
          type: $type
          address: ""
          color: null
          description: ""
          links: []
          longDescription: ""
          related: []
          website: ""
          selfJoinable: true
          studentAssociation: $studentAssociation
        }
      ) {
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            path
            message
          }
        }
        ... on MutationUpsertGroupSuccess {
          data {
            uid
          }
        }
      }
    }
  `);

  export let element: HTMLDialogElement;

  /** The uid of the student association */
  export let studentAssociation: string | null;
  let errors: string[] = [];

  let name = '';
  let uid = '';
  let type: GroupType$options | undefined = undefined;
  let uidUnavailable = false;
</script>

<Modal bind:element>
  <h1>Créer un nouveau groupe</h1>

  <form
    on:submit|preventDefault={async () => {
      if (!type) return;
      const result = await CreateGroup.mutate({ name, uid, type, studentAssociation });
      if (mutationSucceeded('upsertGroup', result)) {
        element.close();
        await goto(`/groups/${result.data.upsertGroup.data.uid}/edit`);
      } else {
        errors = mutationErrorMessages('upsertGroup', result);
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
          element.close();
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
</Modal>

<style>
  section.submit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }
</style>
