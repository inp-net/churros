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
  import InputListOfGroups from './InputListOfGroups.svelte';
  import InputSearchObjectList from './InputSearchObjectList.svelte';
  import { zeus } from '$lib/zeus';
  import Fuse from 'fuse.js';
  import { fromYearTier, schoolYearStart, yearRangeUpTo, yearTier } from '$lib/dates';
  const emit = createEventDispatcher();

  export let expandedTicketId = '';

  function promoLabel(year: number) {
    return `${yearTier(year)}A (${year})`;
  }

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
    openToMajors: Array<{ name: string; shortName: string; id: string }>;
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

    <div class="side-by-side">
      <InputNumber label="Prix" bind:value={ticket.price} />
      <InputNumber label="Nombre de places" bind:value={ticket.capacity} />
    </div>

    <InputLongText rich label="Description" bind:value={ticket.description} />

    <div class="side-by-side">
      <InputDate time label="Date du shotgun" bind:value={ticket.opensAt} />
      <InputDate time label="Clôture" bind:value={ticket.closesAt} />
    </div>

    <InputField label="Promos">
      <ButtonSecondary
        on:click={() => {
          ticket.openToPromotions = [1, 2, 3].map((y) => fromYearTier(y));
        }}>1+2+3As</ButtonSecondary
      >
      <ButtonSecondary
        on:click={() => {
          ticket.openToPromotions = [fromYearTier(1)];
        }}>1As</ButtonSecondary
      >
      <InputSearchObjectList
        search={(q) => {
          const range = yearRangeUpTo(schoolYearStart().getFullYear() + 4, 10);
          return new Fuse(
            range.map((year) => ({
              value: year,
              label: promoLabel(year),
            })),
            { keys: ['label'] }
          )
            .search(q)
            .map(({ item }) => item);
        }}
        valueKey="value"
        labelKey="label"
        bind:values={ticket.openToPromotions}
        objects={ticket.openToPromotions.map((year) => ({
          value: year,
          label: promoLabel(year),
        }))}
      />
    </InputField>

    <InputListOfGroups
      uids={ticket.openToGroups.map(({ uid }) => uid)}
      label="Groupes"
      bind:groups={ticket.openToGroups}
    />

    <InputField label="Écoles">
      <ButtonSecondary
        on:click={() => {
          ticket.openToSchools = [
            {
              name: 'ENSEEIHT',
              uid: 'n7',
              color: '#0000ff',
            },
          ];
        }}>n7</ButtonSecondary
      >
      <ButtonSecondary
        on:click={() => {
          ticket.openToSchools = [
            {
              name: 'ENSEEIHT',
              uid: 'n7',
              color: '#0000ff',
            },
            {
              name: 'ENSIACET',
              uid: 'A7',
              color: '#ff0000',
            },
            { name: 'ENSAT', uid: 'ensat', color: '#00ff00' },
          ];
        }}>INP</ButtonSecondary
      >
      <InputSearchObjectList
        search={async (query) => {
          const { schools } = await $zeus.query({
            schools: {
              name: true,
              color: true,
              uid: true,
            },
          });

          const searcher = new Fuse(schools, { keys: ['name', 'uid'] });
          return searcher.search(query).map(({ item }) => item);
        }}
        labelKey="name"
        valueKey="uid"
        values={ticket.openToSchools.map(({ uid }) => uid)}
        bind:objects={ticket.openToSchools}
      />
    </InputField>

    <InputField label="Filières">
      <InputSearchObjectList
        search={async (query) => {
          const { majors } = await $zeus.query({
            majors: {
              name: true,
              shortName: true,
              id: true,
            },
          });
          const searcher = new Fuse(majors, { keys: ['name', 'shortName'] });
          return searcher.search(query).map((r) => r.item);
        }}
        labelKey="shortName"
        valueKey="id"
        values={ticket.openToMajors.map((r) => r.id)}
        bind:objects={ticket.openToMajors}
      />
    </InputField>

    <div class="conditions">
      <InputCheckbox
        labelFalse="Interdit"
        labelNull="Autorisés"
        labelTrue="Seulement"
        label="Extés"
        ternary
        bind:value={ticket.openToExternal}
      />
      <InputCheckbox
        labelFalse="Interdit"
        labelNull="Autorisés"
        labelTrue="Seulement"
        label="Alumnis"
        ternary
        bind:value={ticket.openToAlumni}
      />
      <InputCheckbox
        labelFalse="Interdit"
        labelNull="Autorisés"
        labelTrue="Seulement"
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

    <footer>
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
            expandedTicketId = '';
          }}
        >
          <IconChevronUp />
        </ButtonGhost>
      </div>
    </footer>
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

  header,
  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    .properties {
      display: flex;
      gap: 1rem;
    }
  }

  .side-by-side,
  .conditions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }
</style>
