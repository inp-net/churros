<script lang="ts">
  import GhostButton from '$lib/components/ButtonGhost.svelte';
  import IconClose from '~icons/mdi/close';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IconPlus from '~icons/mdi/plus';
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/club/[group]/edit/$types';
  import { _clubQuery as clubQuery } from '../../routes/club/[group]/edit/+page';
  import Button from '$lib/components/Button.svelte';
  import { onMount } from 'svelte';
  import Alert from '$lib/components/Alert.svelte';
  import { goto } from '$app/navigation';
  import InputGroup from './InputGroup.svelte';

  export let data: PageData;

  let serverError = '';

  let {
    address,
    color,
    description,
    email,
    links,
    longDescription,
    name,
    selfJoinable,
    type,
    parentId = '',
  } = data.group;

  let otherGroups: Array<{ groupId: string; uid: string }> = [];
  let parentUid = '';
  onMount(async () => {
    // See https://github.com/graphql-editor/graphql-zeus/issues/262

    ({ parentId = '' } = data.group);
    ({ groups: otherGroups } = await $zeus.query({
      groups: [{}, { groupId: true, uid: true }],
    }));
    parentUid = parentId ? otherGroups.find((g) => g.groupId === parentId)?.uid ?? '' : '';
  });
  $: parentId = parentUid ? otherGroups.find((g) => g.uid === parentUid)?.groupId ?? '' : '';

  let loading = false;
  const updateClub = async () => {
    if (loading) return;
    try {
      loading = true;
      const { upsertGroup } = await $zeus.mutate({
        upsertGroup: [
          {
            uid: data.group.uid,
            address,
            color,
            description,
            email,
            links,
            longDescription,
            name,
            selfJoinable,
            parentId,
            type,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpsertGroupSuccess': { data: clubQuery },
          },
        ],
      });

      if (upsertGroup.__typename === 'Error') {
        serverError = upsertGroup.message;
        return;
      }

      serverError = '';
      data.group = upsertGroup.data;
      if (data.group.uid) await goto(`/club/${data.group.uid}/edit`);
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateClub}>
  <fieldset>
    <legend>Informations</legend>
    <p>
      <label
        >Type de groupe : <select bind:value={type}>
          <option value="Association">Association</option>
          <option value="Club">Club</option>
          <option value="Group">Groupe informel</option>
          <option value="Integration">Groupe d'inté</option>
          <option value="StudentAssociationSection">Bureau d'AE</option>
        </select></label
      >
    </p>
    <p><label><input type="checkbox" bind:value={selfJoinable} /> Auto-joignable</label></p>
    <p><label>Nom : <input type="text" bind:value={name} /></label></p>
    <p>
      <label
        >Description courte :
        <input type="text" bind:value={description} />
      </label>
    </p>
    <p>
      Description longue (syntaxe <a
        rel="noreferrer"
        target="_blank"
        href="https://www.markdownguide.org/cheat-sheet/#basic-syntax">Markdown</a
      > supportée) :
    </p>
    <textarea cols="30" rows="10" bind:value={longDescription} />
    <p>
      <label>Couleur : <input type="color" bind:value={color} /></label>
    </p>
    <p>
      <label>Adresse : <input type="text" bind:value={address} /></label>
    </p>
    <p>
      <label>Email : <input type="email" bind:value={email} /></label>
    </p>
    <p>Réseaux sociaux :</p>
    <ul>
      {#each links as link, i}
        <li>
          <input bind:value={link.name} />
          <input bind:value={link.value} />
          <GhostButton
            title="Supprimer"
            on:click={() => {
              links = links.filter((_, j) => i !== j);
            }}
          >
            <IconClose aria-label="Supprimer" />
          </GhostButton>
          {#if i > 0}
            <GhostButton
              title="Remonter"
              on:click={() => {
                links = [...links.slice(0, i - 1), links[i], links[i - 1], ...links.slice(i + 1)];
              }}
            >
              <IconChevronUp aria-label="Remonter" />
            </GhostButton>
          {/if}
        </li>
      {/each}
      <li>
        <button
          type="button"
          on:click={() => {
            links = [...links, { name: '', value: '' }];
          }}><IconPlus aria-hidden="true" />Ajouter</button
        >
      </li>
    </ul>
    <p>
      <InputGroup label="Groupe parent" bind:uid={parentUid} />
    </p>
    {#if serverError}
      <Alert theme="danger"
        >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
      >
    {/if}
    <p>
      <Button type="submit" theme="primary" {loading}>Sauvegarder</Button>
    </p>
  </fieldset>
</form>
