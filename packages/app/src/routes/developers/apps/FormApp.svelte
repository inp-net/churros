<script context="module" lang="ts">
  import type { Group } from '$lib/components/InputGroups.svelte';

  export type ThirdPartyApp = {
    name: string;
    description: string;
    allowedRedirectUris: string;
    website: string;
    ownerGroup: Group | undefined;
  };
</script>

<script lang="ts">
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputGroups from '$lib/components/InputGroups.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { isOnClubBoard } from '$lib/permissions';
  import { me } from '$lib/session';
  export let loading = false;
  export let submitText = 'Confirmer';
  export let app: ThirdPartyApp;
</script>

<form method="post" on:submit|preventDefault>
  <InputText required bind:value={app.name} label="Nom de l'application" maxlength="255"
  ></InputText>
  <InputText required bind:value={app.description} label="Courte description" maxlength="255"
  ></InputText>
  <InputText
    required
    bind:value={app.allowedRedirectUris}
    label="URIs de redirection autorisées"
    hint="Séparer par des espaces"
  ></InputText>
  <InputText
    bind:value={app.website}
    type="url"
    label="Site de l'application"
    hint="Notamment utilisé pour obtenir le logo de l'application"
  ></InputText>
  <InputGroups
    required
    options={$me?.groups.filter((g) => isOnClubBoard(g)).map((g) => g.group) ?? []}
    bind:group={app.ownerGroup}
    label="Groupe responsable de l'application"
  ></InputGroups>
  <section class="submit">
    <ButtonPrimary {loading} submits>{submitText}</ButtonPrimary>
  </section>
  <p class="muted">
    <slot />
  </p>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  section.submit {
    display: flex;
    justify-content: center;
  }

  form p {
    max-width: 500px;
    margin: 0 auto;
    text-align: center;
  }
</style>
