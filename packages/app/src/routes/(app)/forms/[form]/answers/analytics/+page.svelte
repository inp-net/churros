<script lang="ts">
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import { isDark } from '$lib/theme';
  import {
    BarChartSimple,
    HistogramChart,
    ScaleTypes,
    type ChartTabularData,
  } from '@carbon/charts-svelte';
  import '@carbon/charts-svelte/styles.min.css';
  import Header from '../Header.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let absoluteAxes = false;
  $: questions = data.form?.questions.nodes ?? [];

  function displayToNumber(answer: string) {
    const [current, _] = answer.replace('%', '').split('/', 2).map(Number.parseFloat) as [
      number,
      number,
    ];
    return current;
  }

  function questionHasGroupAsEveryOption(q: (typeof questions)[number]) {
    return q.__typename === 'QuestionSelectOne' && q.groups.every(Boolean);
  }

  function scaleAnswersData({
    answerCounts,
  }: (typeof questions)[number] & { __typename: 'QuestionScale' }): ChartTabularData {
    const ret = answerCounts.flatMap(({ key, value: count }) => {
      return Array.from({ length: count }, () => ({
        value: displayToNumber(key),
        group: 'Réponses',
      }));
    });
    return ret;
  }

  /**
   * The domain for the answer counts: [0, option with the most answers' answer count], and if absoluteAxes is true, [0, total answers count]
   */
  function countsDomain(
    q: (typeof questions)[number] & {
      __typename: 'QuestionScale' | `QuestionSelect${'One' | 'Multiple'}`;
    },
    absoluteAxes: boolean,
  ) {
    return [0, absoluteAxes ? q.totalAnswers : Math.max(...q.answerCounts.map((a) => a.value))];
  }
</script>

{#if data.form}
  <Header
    formId={data.form.id}
    linkedEvent={data.form.event}
    linkedGoogleSheetUrl={data.form.linkedGoogleSheetUrl}
    answerCount={data.form.answerCount}
  >
    <InputCheckbox label="Axes absolus" bind:value={absoluteAxes}></InputCheckbox>
  </Header>
{/if}

<div class="charts">
  {#each questions as q (q.id)}
    {#if q.__typename === 'QuestionScale'}
      <HistogramChart
        data={scaleAnswersData(q)}
        options={{
          title: q.title,
          theme: $isDark ? 'g100' : 'white',
          height: '400px',
          axes: {
            bottom: {
              title: 'Réponse',
              mapsTo: 'value',
              domain: [q.minimum, q.maximum],
            },
            left: {
              title: 'Nombre de réponses',
              scaleType: ScaleTypes.LINEAR,
              domain: countsDomain(q, absoluteAxes),
            },
          },
        }}
      ></HistogramChart>
    {:else if q.__typename === 'QuestionSelectMultiple' || q.__typename === 'QuestionSelectOne'}
      <BarChartSimple
        data={q.answerCounts.map(({ key, value }) => ({
          group: key,
          value,
        }))}
        options={{
          title: q.title,
          height: `${Math.min(
            100 + q.answerCounts.length * 60,
            Math.ceil((3 / 4) * window.innerHeight),
          )}px`,
          theme: $isDark ? 'g100' : 'white',
          getFillColor: questionHasGroupAsEveryOption(q)
            ? (key, _, __, defaultFillColor) => {
                const group =
                  q.__typename === 'QuestionSelectOne'
                    ? q.groups?.find((g) => g.name === key)
                    : undefined;

                return group?.color ?? defaultFillColor ?? '#fff';
              }
            : undefined,
          axes: {
            left: {
              title: 'Réponse',
              scaleType: ScaleTypes.LABELS,
              mapsTo: 'group',
            },
            bottom: {
              title: 'Nombre de réponses',
              domain: countsDomain(q, absoluteAxes),
            },
          },
        }}
      ></BarChartSimple>
    {/if}
  {/each}
</div>

<style>
  .charts {
    display: flex;
    flex-wrap: wrap;
    gap: 3rem;
    justify-content: center;
  }

  .charts :global(> *) {
    /* width: calc(50% - var(--gap)); */
    max-width: 600px;
  }
</style>
