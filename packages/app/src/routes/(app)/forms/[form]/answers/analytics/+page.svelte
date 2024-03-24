<script lang="ts">
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import { isDark } from '$lib/theme';
  import { BarChartSimple, ScaleTypes } from '@carbon/charts-svelte';
  import '@carbon/charts-svelte/styles.min.css';
  import Header from '../Header.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let absoluteAxes = false;
  $: questions = data.form?.questions.nodes ?? [];
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

{#each questions as q (q.id)}
  {#if q.__typename === 'QuestionSelectMultiple' || q.__typename === 'QuestionSelectOne' || q.__typename === 'QuestionScale'}
    <BarChartSimple
      data={q.answerCounts.map(({ key, value }) => ({ group: key, value }))}
      options={{
        title: q.title,
        height: 100 + q.answerCounts.length * 60 + 'px',
        theme: $isDark ? 'g100' : 'white',
        axes: {
          left: { title: 'Réponse', scaleType: ScaleTypes.LABELS, mapsTo: 'group' },
          bottom: {
            title: 'Nombre de réponses',
            // ...(absoluteAxes ? { domain: [0, q.totalAnswers] } : {}),
            domain: [
              0,
              absoluteAxes ? q.totalAnswers : Math.max(...q.answerCounts.map((a) => a.value)),
            ],
          },
        },
      }}
    ></BarChartSimple>
  {/if}
{/each}
