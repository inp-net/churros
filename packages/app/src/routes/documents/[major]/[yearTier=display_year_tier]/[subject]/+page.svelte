<script lang="ts">
  import type { PageData } from './$types';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { page } from '$app/stores';
  import CardDocument from '$lib/components/CardDocument.svelte';
  import { DISPLAY_DOCUMENT_TYPES, ICONS_DOCUMENT_TYPES, ORDER_DOCUMENT_TYPES } from '$lib/display';
  import { DocumentType } from '$lib/zeus';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let data: PageData;

  const documentTypesWithSolutions = new Set<DocumentType>([
    DocumentType.Exam,
    DocumentType.Exercises,
    DocumentType.GradedExercises,
    DocumentType.Practical,
    DocumentType.PracticalExam,
  ]);
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="../..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb href="..">{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb>
  <Breadcrumb>{data.subject.shortName || data.subject.name}</Breadcrumb>
</Breadcrumbs>

{#if data.subject.links.length > 0}
  <section class="links">
    <ul class="nobullet">
      {#each data.subject.links as { name, computedValue }}
        <li>
          <ButtonSecondary href={computedValue}>{name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#if data.documentsOfSubject.edges.length > 0}
  {#each ORDER_DOCUMENT_TYPES as type}
    {@const documents = data.documentsOfSubject.edges
      .filter(({ node }) => node.type === type)
      .map((e) => e.node)}

    <h2 class="typo-field-label">
      <svelte:component this={ICONS_DOCUMENT_TYPES.get(type)}></svelte:component>
      {DISPLAY_DOCUMENT_TYPES.get(type)}
    </h2>

    <ul class="nobullet">
      {#each documents as { solutionPaths, uid, ...rest }}
        <li>
          <CardDocument
            href="./{uid}"
            hasSolution={documentTypesWithSolutions.has(type)
              ? solutionPaths.length > 0
              : undefined}
            {...rest}
          ></CardDocument>
        </li>
      {/each}
      <li class="new">
        <CardDocument createdAt={new Date()} add href="./create?type={type}" title="Ajouter"
        ></CardDocument>
      </li>
    </ul>
  {/each}
{:else}
  <div class="no-docs">
    Aucun document… <br /><ButtonSecondary href="./create">Ajouter un document ❤️</ButtonSecondary>
  </div>
{/if}

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
