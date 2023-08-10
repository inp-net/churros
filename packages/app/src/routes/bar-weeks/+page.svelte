<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import IconConfirm from '~icons/mdi/check';
  import IconDelete from '~icons/mdi/delete';
  import Alert from '$lib/components/Alert.svelte';
  import IconEdit from '~icons/mdi/pencil';
  import DateInput from '$lib/components/InputDate.svelte';
  import { compareDesc, endOfWeek, isFuture, startOfWeek } from 'date-fns';
  import type { PageData } from './$types';
  import { zeus } from '$lib/zeus';
  import { dateFormatter } from '$lib/dates';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputListOfGroups from '$lib/components/InputListOfGroups.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';

  export let data: PageData;

  const EMPTY_BAR_WEEK = {
    id: undefined,
    description: '',
    groups: [] as Array<{ uid: string; pictureFile: string; name: string }>,
    startsAt: startOfWeek(new Date()),
    endsAt: endOfWeek(new Date()),
  };

  let { barWeeks } = data;
  let newBarWeek = EMPTY_BAR_WEEK;
  const serverErrors: Record<string, string> = {};
  let expandedBarWeekId: string | undefined = undefined;
  let showPastBarWeeks = false;

  async function deleteBarWeek({ id }: { id: string }) {
    await $zeus.mutate({
      deleteBarWeek: [{ id }, true],
    });
    barWeeks = barWeeks.filter((bw) => bw.id !== id);
  }

  async function updateBarWeek(barWeek: {
    id: string | undefined;
    description: string;
    groups: Array<{ uid: string }>;
    startsAt: Date;
    endsAt: Date;
  }) {
    const { upsertBarWeek } = await $zeus.mutate({
      upsertBarWeek: [
        {
          description: barWeek.description,
          endsAt: barWeek.endsAt,
          startsAt: barWeek.startsAt,
          id: barWeek.id,
          groupsUids: barWeek.groups.map(({ uid }) => uid),
        },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on MutationUpsertBarWeekSuccess': {
            data: {
              id: true,
              description: true,
              descriptionHtml: true,
              endsAt: true,
              startsAt: true,
              groups: {
                uid: true,
                name: true,
                pictureFile: true,
              },
              uid: true,
            },
          },
        },
      ],
    });

    if (upsertBarWeek.__typename === 'Error') {
      serverErrors[barWeek.id ?? 'new'] = upsertBarWeek.message;
      console.error(upsertBarWeek.message);
      return;
    }

    // XXX for some reason the mutations returns stringified dates
    upsertBarWeek.data = {
      ...upsertBarWeek.data,
      startsAt: new Date(upsertBarWeek.data.startsAt),
      endsAt: new Date(upsertBarWeek.data.endsAt),
    };

    serverErrors[barWeek.id ?? 'new'] = '';
    expandedBarWeekId = undefined;
    if (barWeek.id === undefined) {
      barWeeks = [...barWeeks, upsertBarWeek.data];
      newBarWeek = EMPTY_BAR_WEEK;
    } else {
      barWeeks = barWeeks.map((bw) => (bw.id === barWeek.id ? upsertBarWeek.data : bw));
    }
  }
</script>

<div class="content">
  <h1>
    Semaines de bar
    <div class="toggle-past">
      <InputCheckbox alignRight label="Passées" bind:value={showPastBarWeeks} />
    </div>
  </h1>

  <ul class="nobullet">
    {#each barWeeks
      .filter((b) => showPastBarWeeks || isFuture(b.endsAt))
      .sort((a, b) => compareDesc(a.startsAt, b.startsAt)) as barWeek, i (barWeek.id)}
      <li>
        <Card>
          <h3>
            {dateFormatter.format(barWeek.startsAt)}—{dateFormatter.format(barWeek.endsAt)}
            {barWeek.groups.map(({ name }) => name).join(', ')}
          </h3>
          {#if expandedBarWeekId === barWeek.id}
            <InputText label="Description" bind:value={barWeek.description} />

            <InputListOfGroups
              label="Groupes"
              bind:groups={barWeeks[i].groups}
              uids={barWeek.groups.map((g) => g.uid)}
            />

            <div class="side-by-side">
              <DateInput label="Début" bind:value={barWeeks[i].startsAt} />
              <DateInput label="Fin" bind:value={barWeeks[i].endsAt} />
            </div>
            {#if serverErrors[barWeek.id]}
              <Alert theme="danger">{serverErrors[barWeek.id]}</Alert>
            {/if}
            <section class="actions">
              <ButtonSecondary icon={IconConfirm} on:click={async () => updateBarWeek(barWeek)}
                >Enregistrer
              </ButtonSecondary>
              <ButtonSecondary
                danger
                icon={IconDelete}
                on:click={async () => deleteBarWeek(barWeek)}>Supprimer</ButtonSecondary
              >
            </section>
          {:else}
            <div class="description">
              {@html barWeek.descriptionHtml}
            </div>
            <section class="actions">
              <ButtonSecondary
                icon={IconEdit}
                on:click={() => {
                  expandedBarWeekId = barWeek.id;
                }}>Modifier</ButtonSecondary
              >
              <ButtonSecondary
                danger
                icon={IconDelete}
                on:click={async () => deleteBarWeek(barWeek)}>Supprimer</ButtonSecondary
              >
            </section>
          {/if}
        </Card>
      </li>
    {:else}
      <li>Aucune semaine de bar à afficher.</li>
    {/each}
  </ul>

  <h2>Nouvelle semaine de bar</h2>

  <Card>
    <form class="new-bar-week" on:submit|preventDefault={async () => updateBarWeek(newBarWeek)}>
      <InputListOfGroups
        label="Groupes"
        bind:groups={newBarWeek.groups}
        uids={newBarWeek.groups.map((g) => g.uid)}
      />
      <InputText label="Description" bind:value={newBarWeek.description} />
      <div class="side-by-side">
        <DateInput label="Début" bind:value={newBarWeek.startsAt} />
        <DateInput label="Fin" bind:value={newBarWeek.endsAt} />
      </div>
      {#if serverErrors.new}
        <Alert theme="danger">{serverErrors.new}</Alert>
      {/if}
      <section class="submit">
        <ButtonPrimary submits>Ajouter</ButtonPrimary>
      </section>
    </form>
  </Card>
</div>

<style>
  .content {
    max-width: 600px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }

  .toggle-past {
    font-size: 1rem;
    font-weight: normal;
  }

  h2 {
    margin-top: 2rem;
  }

  .new-bar-week {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .new-bar-week .submit {
    display: flex;
    justify-content: center;
  }

  .side-by-side {
    display: flex;
    flex-flow: row wrap;
    gap: 1rem;
  }

  section.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-top: 1.5rem;
  }
</style>
