<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import type { PageData } from './$types';
  import CardMajor from '$lib/components/CardMajor.svelte';
  export let data: PageData;
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb>{data.major.shortName}</Breadcrumb>
</Breadcrumbs>

<h2 class="typo-field-label">Étudiants</h2>
<ul class="nobullet">
  <li>
    <CardMajor name="FISE" shortName="1A" href="./1a-fise" />
  </li>
  <li>
    <CardMajor name="FISE" shortName="2A" href="./2a-fise" />
  </li>
  <li>
    <CardMajor name="3A" href="./3a" />
  </li>
</ul>

<h2 class="typo-field-label">Apprentis</h2>

<ul class="nobullet">
  <li>
    <CardMajor name="FISA" shortName="1A" href="./1a-fisa" />
  </li>
  <li>
    <CardMajor name="FISA" shortName="2A" href="./2a-fisa" />
  </li>
  <li>
    <CardMajor name="3A" href="./3a" />
  </li>
</ul>

<style>
  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2 {
    margin-top: 1.5rem;
    margin-bottom: 0.5em;
    margin-left: calc(2 * var(--border-block));
    font-size: 1rem;
    font-weight: bold;

    &:first-of-type {
      margin-top: 2rem;
    }
  }
</style>
