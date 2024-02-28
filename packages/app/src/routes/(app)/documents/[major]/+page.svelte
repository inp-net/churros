<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { PageData } from './$houdini';
  import CardMajor from '$lib/components/CardMajor.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { page } from '$app/stores';
  import WipMigrationNotice from './WIPMigrationNotice.svelte';

  export let data: PageData;
  $: ({ DocumentsOfMajor } = data);
  $: major = $DocumentsOfMajor.data?.major;
</script>

{#if !major}
  <LoadingSpinner></LoadingSpinner> Chargement…
{:else}
  <Breadcrumbs root="/documents">
    <Breadcrumb>{major.shortName}</Breadcrumb>
  </Breadcrumbs>

  {#if major.shortName === '3EA' && !$page.url.searchParams.has('continue')}
    <section class="work-in-progress">
      <h1>Frappe des 3EAs en cours de migration</h1>
      <p>
        Pour faire avancer la migration, contactes <a href="/@lebihae">Ewen Le Bihan</a> et tu pourras
        contribuer à son avancement.
      </p>
      <p>
        En effet, je (Ewen) ne suis pas en 3EA, et vos parcours ont étés complètement réorganisés,
        donc j'ai besoin d'aide pour savoir où quelles matières de l'ancienne Frappe doivent aller.
      </p>
      <p>
        En attendant, tu peux toujours te rendre sur <ButtonSecondary
          insideProse
          href="https://bde.enseeiht.fr/services/frappe/">l'ancienne Frappe</ButtonSecondary
        > ou <ButtonSecondary insideProse href="?continue">continuer</ButtonSecondary>, même si tout
        n'est pas encore importé.
      </p>
    </section>
  {:else}
    <WipMigrationNotice></WipMigrationNotice>

    <section class="fise">
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
    </section>

    <section class="fisa">
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
    </section>
  {/if}
{/if}

<style>
  .work-in-progress {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2:not(.migration-notice) {
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
