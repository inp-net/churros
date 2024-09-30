<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import type { PageData } from './$types';
  import WipMigrationNotice from './WIPMigrationNotice.svelte';

  export let data: PageData;
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb>{data.major.shortName}</Breadcrumb>
</Breadcrumbs>

{#if data.major.shortName === '3EA' && !$page.url.searchParams.has('continue')}
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
    <Submenu>
      <SubmenuItem icon={null} subtext="FISE" href="./1a-fise">1A</SubmenuItem>
      <SubmenuItem icon={null} subtext="FISE" href="./2a-fise">2A</SubmenuItem>
      <SubmenuItem icon={null} href="./3a">3A</SubmenuItem>
    </Submenu>
  </section>

  <section class="fisa">
    <h2 class="typo-field-label">Apprentis</h2>
    <Submenu>
      <SubmenuItem icon={null} subtext="FISA" href="./1a-fisa">1A</SubmenuItem>
      <SubmenuItem icon={null} subtext="FISA" href="./2a-fisa">2A</SubmenuItem>
      <SubmenuItem icon={null} href="./3a">3A</SubmenuItem>
    </Submenu>
  </section>
{/if}

<style>
  .work-in-progress {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
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
