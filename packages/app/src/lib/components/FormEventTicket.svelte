<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputField from './InputField.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputText from './InputText.svelte';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IntegerListInput from './InputIntegerList.svelte';
  import SchoolListInput from './InputSchoolList.svelte';
  import InputListOfGroups from './InputListOfGroups.svelte';
  const emit = createEventDispatcher();

  export let expandedTicketId = '';

  export let ticket: {
    id: string;
    name: string;
    description: string;
    opensAt?: Date | undefined;
    closesAt?: Date | undefined;
    price: number;
    capacity: number;
    openToPromotions: number[];
    openToSchools: Array<{ name: string; color: string; uid: string }>;
    openToGroups: Array<{ name: string; uid: string; pictureFile: string }>;
    openToExternal?: boolean | null | undefined;
    openToAlumni?: boolean | null | undefined;
    openToNonAEContributors?: boolean | null | undefined;
    godsonLimit: number;
    onlyManagersCanProvide: boolean;
  };

  $: expanded = expandedTicketId === ticket.id;
</script>

<article class="ticket" data-id={ticket.id} class:expanded>
  <header>
    <div class="properties">
      <span class="name">{ticket.name}</span>
      <span class="capacity">{ticket.capacity} place{ticket.capacity > 1 ? 's' : ''}</span>
      <span class="prix">{ticket.price}€</span>
    </div>
    <div class="actions">
      <ButtonSecondary
        on:click={() => {
          expandedTicketId = '';
          emit('delete');
        }}
        danger>Supprimer</ButtonSecondary
      >
      <ButtonGhost
        class="toggle-expanded"
        on:click={() => {
          expandedTicketId = expanded ? '' : ticket.id;
        }}
      >
        {#if expanded}
          <IconChevronUp />
        {:else}
          <IconChevronDown />
        {/if}
      </ButtonGhost>
    </div>
  </header>
  {#if expanded}
    <InputText required label="Nom" bind:value={ticket.name} />

    <InputLongText rich label="Description" bind:value={ticket.description} />

    <div class="side-by-side">
      <InputDate time label="Date du shotgun" bind:value={ticket.opensAt} />
      <InputDate time label="Clôture" bind:value={ticket.closesAt} />
    </div>

    <div class="side-by-side">
      <InputNumber label="Prix" bind:value={ticket.price} />
      <InputNumber label="Nombre de places" bind:value={ticket.capacity} />
    </div>

    <InputField label="Promos">
      <IntegerListInput bind:value={ticket.openToPromotions} />
    </InputField>

    <InputListOfGroups
      uids={ticket.openToGroups.map(({ uid }) => uid)}
      label="Groupes"
      bind:groups={ticket.openToGroups}
    />

    <InputField label="Écoles">
      <SchoolListInput bind:value={ticket.openToSchools} />
    </InputField>

    <div class="conditions">
      <InputCheckbox
        labelFalse="Interdit"
        labelNull="Peu importe"
        labelTrue="Obligatoire"
        label="Extés"
        ternary
        bind:value={ticket.openToExternal}
      />
      <InputCheckbox
        labelFalse="Interdit"
        labelNull="Peu importe"
        labelTrue="Obligatoire"
        label="Alumnis"
        ternary
        bind:value={ticket.openToAlumni}
      />
      <InputCheckbox
        labelFalse="Interdit"
        labelNull="Peu importe"
        labelTrue="Obligatoire"
        label="Cotisants"
        ternary
        bind:value={ticket.openToNonAEContributors}
      />
    </div>

    <InputNumber label="Limite de parrainages" bind:value={ticket.godsonLimit} />

    <InputCheckbox
      label="Seul un manager peut donner ce billet"
      bind:value={ticket.onlyManagersCanProvide}
    />

    <div class="actions">
      <ButtonSecondary
        on:click={() => {
          expandedTicketId = '';
          emit('delete');
        }}
        danger>Supprimer</ButtonSecondary
      >

      <ButtonGhost
        class="toggle-expanded"
        on:click={() => {
          expandedTicketId = '';
        }}
      >
        <IconChevronUp />
      </ButtonGhost>
    </div>
  {/if}
</article>

<style lang="scss">
  .ticket {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    width: 500px;
    max-width: 100%;
    padding: 1em;
    border-radius: var(--radius-block);
    box-shadow: var(--shadow);

    :global(.toggle-expanded) {
      margin-left: auto;
    }
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .properties {
      display: flex;
      gap: 1rem;
    }
  }
</style>
