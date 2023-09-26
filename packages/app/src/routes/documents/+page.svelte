<script lang="ts">
  import CardMajor from '$lib/components/CardMajor.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<ul class="nobullet">
  {#each data.majors as major}
    <li>
      <CardMajor href="./{major.uid}" {...major}></CardMajor>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }
</style>
