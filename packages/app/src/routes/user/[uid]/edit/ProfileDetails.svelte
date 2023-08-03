<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import InputGroup from '$lib/components/groups/InputGroup.svelte';
  import { zeus } from '$lib/zeus';
  import IconClose from '~icons/mdi/close';
  import IconPlus from '~icons/mdi/plus';
  import type { PageData } from './$types';
  import { _userQuery as userQuery } from './+page';
  import LinkCollectionInput from '$lib/components/inputs/LinkCollectionInput.svelte';

  export let data: PageData;

  // We don't want form bindings to be reactive to let them evolve separately from the data
  let {
    address,
    description,
    graduationYear,
    links,
    majorId,
    nickname,
    phone,
    email,
    // See https://github.com/graphql-editor/graphql-zeus/issues/262
    // eslint-disable-next-line unicorn/no-null
    birthday = null,
  } = data.user;

  const valueAsDate = (x: unknown) => (x as HTMLInputElement).valueAsDate;

  let loading = false;
  const updateUser = async () => {
    if (loading) return;
    try {
      loading = true;
      const { updateUser } = await $zeus.mutate({
        updateUser: [
          {
            uid: data.user.uid,
            nickname,
            description,
            links,
            address,
            graduationYear,
            majorId,
            phone,
            birthday,
            email,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpdateUserSuccess': { data: userQuery },
          },
        ],
      });

      if (updateUser.__typename === 'Error') {
        console.error(updateUser.message);
        return;
      }

      data.user = updateUser.data;
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateUser}>
  <fieldset>
    <legend>Informations personnelles</legend>
    <p>
      <label>Surnom : <input type="text" bind:value={nickname} /></label>
    </p>
    <p>
      <label>Description : <input type="text" bind:value={description} /></label>
    </p>
    <p>Réseaux sociaux :</p>
    <LinkCollectionInput bind:value={links} />
    <p>
      Filière et promotion :
      <InputGroup>
        <select bind:value={majorId}>
          {#each data.schoolGroups as { majors, names }}
            <optgroup label={names.join(', ')}>
              {#each majors as { id, name }}
                <option value={id}>{name}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
        <input type="number" bind:value={graduationYear} size="4" />
      </InputGroup>
    </p>
    <p>
      Anniversaire :
      {#if birthday === null}
        <GhostButton
          on:click={() => {
            birthday = new Date();
          }}
        >
          <IconPlus aria-label="Ajouter" />
        </GhostButton>
      {:else}
        <input
          type="date"
          value={birthday.toISOString().slice(0, 10)}
          on:change={({ target }) => {
            birthday = valueAsDate(target);
          }}
        />
        <GhostButton
          on:click={() => {
            // We use null rather than undefined because only null exists in JSON
            // eslint-disable-next-line unicorn/no-null
            birthday = null;
          }}
        >
          <IconClose aria-label="Supprimer" />
        </GhostButton>
      {/if}
    </p>
    <p>
      <label>
        Adresse : <input type="text" bind:value={address} />
      </label>
    </p>
    <p>
      <label>
        Phone : <input type="tel" bind:value={phone} />
      </label>
    </p>
    <p><label>Adresse mail : <input type="email" bind:value={email} /> </label></p>
    <p>
      <Button type="submit" theme="primary" {loading}>Sauvegarder</Button>
    </p>
  </fieldset>
</form>
