<script lang="ts">
  import { enhance } from '$app/forms';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import InputGroups, { type Group } from '$lib/components/InputGroups.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputVisibility from '$lib/components/InputVisibility.svelte';
  import { Visibility } from '$lib/zeus';
  import IconExpand from '~icons/mdi/chevron-down';
  import IconCollapse from '~icons/mdi/chevron-up';

  export let data:
    | {
        id: string;
        group?: Group | undefined;
        title: string;
        visibility: Visibility;
        closesAt?: Date | undefined;
        description: string;
      }
    | undefined = undefined;

  const currentData: Omit<NonNullable<typeof data>, 'id'> = data ?? {
    group: undefined,
    title: '',
    visibility: Visibility.Unlisted,
    closesAt: undefined,
    description: '',
  };

  $: if (!currentData.group) currentData.visibility = Visibility.Unlisted;

  export let availableGroups: Group[] = [];
  export let collapsible = false;
  export let collapsed = false;

  let submitting = false;
</script>

<form
  method="post"
  on:submit={() => {
    submitting = true;
  }}
  use:enhance={() =>
    ({ update }) => {
      submitting = false;
      if (collapsible) collapsed = true;
      update();
    }}
  action="/forms?/upsertForm"
  class:collapsed
>
  {#if data}
    <input type="hidden" name="id" value={data.id} />
  {/if}
  {#if collapsible}
    <div class="collapse">
      <slot name="header-when-collapsible" />
      <ButtonGhost
        help={collapsed ? 'Développer' : 'Réduire'}
        on:click={() => {
          collapsed = !collapsed;
        }}
      >
        {#if collapsed}<IconExpand />{:else}<IconCollapse />{/if}
      </ButtonGhost>
    </div>
  {/if}
  <div class="collapsible-content">
    <section class="inputs">
      <div class="group-and-title">
        <InputGroups
          name="group"
          placeholder="&nbsp;"
          label="Groupe responsable"
          options={availableGroups}
          bind:group={currentData.group}
        ></InputGroups>
        <InputText name="title" label="Titre" bind:value={currentData.title} required></InputText>
      </div>
      <div class="visibility-and-dates">
        <InputVisibility
          disabled={!currentData.group}
          help={currentData.group
            ? undefined
            : 'Vous devez choisir un groupe pour changer la visibilité'}
          name="visibility"
          bind:value={currentData.visibility}
        ></InputVisibility>
        <span class="separator">·</span>
        <InputDate name="open-until" bind:value={currentData.closesAt} label="Ouvert jusqu'au" time
        ></InputDate>
      </div>
      <InputLongText
        name="description"
        rich
        label="Description"
        bind:value={currentData.description}
      ></InputLongText>
    </section>
  </div>
  <section class="actions">
    {#if collapsed}
      <ButtonPrimary on:click={() => (collapsed = false)}>Modifier</ButtonPrimary>
    {:else}
      <ButtonPrimary loading={submitting} submits>
        {#if data && collapsible}
          Enregistrer
        {:else if data}
          Modifier
        {:else}
          Créer
        {/if}
      </ButtonPrimary>
    {/if}
  </section>
</form>

<style>
  .group-and-title {
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: min-content 1fr;
    column-gap: 2em;
  }

  .visibility-and-dates {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1em;
    align-items: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2em;
    padding: 1em;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .collapsible-content {
    max-height: 1000px;
    transition: all 0.25s ease;
  }

  form.collapsed .collapsible-content {
    height: 0;
    max-height: 0;

    /* Compensate for double gap created by 0-height element */
    margin-bottom: -2em;
    overflow: hidden;
    opacity: 0;
  }

  .collapse {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  section.actions {
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: end;
  }
</style>
