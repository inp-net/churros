<script lang="ts">
  import type { PageData } from './$houdini';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { page } from '$app/stores';
  import CardDocument from '$lib/components/CardDocument.svelte';
  import { DISPLAY_DOCUMENT_TYPES, ICONS_DOCUMENT_TYPES, ORDER_DOCUMENT_TYPES } from '$lib/display';
  import { DocumentType } from '$lib/zeus';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import WipMigrationNotice from '../../WIPMigrationNotice.svelte';

  export let data: PageData;
  $: ({ DocumentsOfSubject } = data);
  $: ({ documentsOfSubject, subject, major } = $DocumentsOfSubject.data ?? {
    subject: undefined,
    documentsOfSubject: { edges: [] },
    major: undefined,
  });

  const documentTypesWithSolutions = new Set<DocumentType>([
    DocumentType.Exam,
    DocumentType.Exercises,
    DocumentType.GradedExercises,
    DocumentType.Practical,
    DocumentType.PracticalExam,
  ]);

  $: documentsByType = ORDER_DOCUMENT_TYPES.map((type) => [
    type,
    documentsOfSubject?.edges.filter((e) => e?.node.type === type).map((e) => e?.node),
  ]).sort(
    ([_, aDocs], [__, bDocs]) => Number(bDocs?.length > 0 ?? 0) - Number(aDocs?.length > 0 ?? 0),
  );
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

{#if documentsByType && documentsOfSubject && documentsOfSubject.edges.length > 0}
  {#each documentsByType as [type, documents]}
    <section class={type.toLowerCase()}>
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
    </section>
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
