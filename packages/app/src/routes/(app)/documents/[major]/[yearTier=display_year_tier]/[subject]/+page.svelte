<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardDocument from '$lib/components/CardDocument.svelte';
  import CardText from '$lib/components/CardText.svelte';
  import { DISPLAY_DOCUMENT_TYPES, ICONS_DOCUMENT_TYPES } from '$lib/display';
  import { notNull } from '$lib/typing';
  import WipMigrationNotice from '../../WIPMigrationNotice.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ DocumentsOfSubject, documentsByType } = data);
  $: ({ subject, major } = $DocumentsOfSubject.data ?? {
    subject: undefined,
    major: undefined,
  });
</script>

<Breadcrumbs root="/documents">
  {#if major}
    <Breadcrumb href="../..">{major.shortName}</Breadcrumb>
  {/if}
  <Breadcrumb href="..">{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb>
  {#if subject}
    <Breadcrumb
      >{subject.emoji ? `${subject.emoji} ` : ''}{subject.shortName || subject.name}</Breadcrumb
    >
  {/if}
</Breadcrumbs>

<WipMigrationNotice></WipMigrationNotice>

{#if subject && subject.links.length > 0}
  <section class="links">
    <ul class="nobullet">
      {#each subject.links as { name, computedValue }}
        <li>
          <ButtonSecondary href={computedValue}>{name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#each documentsByType as [type, documents]}
  <section class={type.toLowerCase()}>
    <h2 class="typo-field-label">
      <svelte:component this={ICONS_DOCUMENT_TYPES.get(type)}></svelte:component>
      {DISPLAY_DOCUMENT_TYPES.get(type)}
    </h2>
    <ul class="nobullet">
      {#each documents.filter(notNull) as document (document.id)}
        <li>
          <CardDocument href="./{document.uid}" {document}></CardDocument>
        </li>
      {/each}
      <li class="new">
        <CardText dashed href="./create?type={type}">
          <svelte:fragment slot="header">Ajouter</svelte:fragment>
          <span class="muted">Contribue à la Frappe :)</span>
        </CardText>
      </li>
    </ul>
  </section>
{:else}
  <div class="no-docs">
    Aucun document… <br /><ButtonSecondary href="./create">Ajouter un document ❤️</ButtonSecondary>
  </div>
{/each}

<style lang="scss">
  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .no-docs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    height: 20rem;
    max-height: 100%;
    margin-top: 2rem;
    text-align: center;
  }

  section.links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
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
