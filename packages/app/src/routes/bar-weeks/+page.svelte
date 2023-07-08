<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import IconEdit from '~icons/mdi/pencil';
  import DateInput from '$lib/components/InputDate.svelte';
  import InputField from '$lib/components/InputField.svelte';

  import StringListInput from '$lib/components/InputStringList.svelte';
  import { endOfWeek, startOfWeek } from 'date-fns';
  import type { PageData } from './$types';
  import Button from '$lib/components/Button.svelte';
  import { zeus } from '$lib/zeus';
  import GhostButton from '$lib/components/ButtonGhost.svelte';
  import { dateFormatter } from '$lib/dates';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asstringarray = (x: any) => x as string[];

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

  $: console.log(barWeeks);

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

    // upsertBarWeek.data = {
    //   ...upsertBarWeek.data,
    //   startsAt: upsertBarWeek.data.startsAt,
    //   endsAt: upsertBarWeek.data.endsAt
    // };

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

<h1>Semaines de bar</h1>

<ul class="nobullet">
  {#each barWeeks as barWeek, i (barWeek.id)}
    <li>
      <Card>
        {#if expandedBarWeekId === barWeek.id}
          <InputField label="Description">
            <textarea bind:value={barWeeks[i].description} cols="30" rows="10" />
          </InputField>

          <InputField label="Groupes">
            <StringListInput
              on:input={(e) => {
                if (!e.detail) return;
                const val = asstringarray(e.detail);
                if (
                  barWeek.groups
                    .map(({ uid }) => uid)
                    .sort()
                    .join(',') === val.sort().join(',')
                )
                  return;
                barWeeks[i].groups = val.map((uid) => ({ uid, name: '', pictureFile: '' }));
              }}
              value={barWeek.groups.map(({ uid }) => uid)}
            />
          </InputField>
          <div class="side-by-side">
            <DateInput label="Début" bind:value={barWeeks[i].startsAt} />
            <DateInput label="Fin" bind:value={barWeeks[i].endsAt} />
          </div>
          {#if serverErrors[barWeek.id]}
            <Alert theme="danger">{serverErrors[barWeek.id]}</Alert>
          {/if}
          <Button on:click={async () => updateBarWeek(barWeek)}>Enregistrer</Button>
        {:else}
          <h2>
            {dateFormatter.format(barWeek.startsAt)}—{dateFormatter.format(barWeek.endsAt)}
            {barWeek.groups.map(({ name }) => name).join(', ')}
          </h2>
          <div class="description">
            {@html barWeek.descriptionHtml}
          </div>
          <GhostButton
            on:click={() => {
              expandedBarWeekId = barWeek.id;
            }}><IconEdit /></GhostButton
          >
        {/if}
        <Button theme="danger" on:click={async () => deleteBarWeek(barWeek)}>Supprimer</Button>
      </Card>
    </li>
  {/each}
  <li>
    <Card>
      <InputField label="Description">
        <textarea bind:value={newBarWeek.description} cols="30" rows="10" />
      </InputField>

      <InputField label="Groupes">
        <StringListInput value={newBarWeek.groups.map(({ uid }) => uid)} />
      </InputField>
      <div class="side-by-side">
        <DateInput label="Début" bind:value={newBarWeek.startsAt} />
        <DateInput label="Fin" bind:value={newBarWeek.endsAt} />
      </div>

      {#if serverErrors.new}
        <Alert theme="danger">{serverErrors.new}</Alert>
      {/if}
      <Button on:click={async () => updateBarWeek(newBarWeek)}>Ajouter</Button>
    </Card>
  </li>
</ul>
