<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FormDocument from '$lib/components/FormDocument.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="../../../..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb href="../../..">{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb
  >
  <Breadcrumb href="../..">
    {data.subject.emoji ? `${data.subject.emoji} ` : ''}
    {data.subject.shortName || data.subject.name}</Breadcrumb
  >
  <Breadcrumb href=".."
    >{data.document.title} <span class="muted">&nbsp;({data.document.schoolYear})</span></Breadcrumb
  >
  <Breadcrumb><em>Modifier</em></Breadcrumb>
</Breadcrumbs>

<h2>Modifier {data.document.title}</h2>

<FormDocument data={data.document}></FormDocument>

<style>
  h2 {
    margin: 2rem 0;
    text-align: center;
  }
</style>
