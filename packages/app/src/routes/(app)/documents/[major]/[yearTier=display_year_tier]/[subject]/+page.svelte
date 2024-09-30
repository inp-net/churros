<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { DISPLAY_DOCUMENT_TYPES, ICONS_DOCUMENT_TYPES, ORDER_DOCUMENT_TYPES } from '$lib/display';
  import { DocumentType } from '$lib/zeus';
  import WipMigrationNotice from '../../WIPMigrationNotice.svelte';
  import type { PageData } from './$types';
  import IconCheck from '~icons/msl/check';

  export let data: PageData;

  const documentTypesWithSolutions = new Set<DocumentType>([
    DocumentType.Exam,
    DocumentType.Exercises,
    DocumentType.GradedExercises,
    DocumentType.Practical,
    DocumentType.PracticalExam,
  ]);

  const documentsByType = ORDER_DOCUMENT_TYPES.map((type) => [
    type,
    data.subject.documents.edges.filter(({ node }) => node.type === type).map((e) => e.node),
  ]).sort(
    ([_, aDocs], [__, bDocs]) => Number(bDocs.length > 0) - Number(aDocs.length > 0),
  ) as unknown as Array<
    [DocumentType, Array<(typeof data.subject.documents.edges)[number]['node']>]
  >;
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="../..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb href="..">{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb>
  <Breadcrumb
    >{data.subject.emoji ? `${data.subject.emoji} ` : ''}{data.subject.shortName ||
      data.subject.name}</Breadcrumb
  >
</Breadcrumbs>

<WipMigrationNotice></WipMigrationNotice>

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

{#if data.subject.documents.edges.length > 0}
  {#each documentsByType as [type, documents]}
    <section class={type.toLowerCase()}>
      <h2 class="typo-field-label">
        <svelte:component this={ICONS_DOCUMENT_TYPES.get(type)}></svelte:component>
        {DISPLAY_DOCUMENT_TYPES.get(type)}
      </h2>
      <Submenu>
        {#each documents as { solutionPaths, uid, ...rest }}
          <SubmenuItem href="./{uid}" icon={null}>
            <span class="has-solution" slot="subtext" class:success={solutionPaths.length > 0}>
              {#if documentTypesWithSolutions.has(type) && solutionPaths.length > 0}
                <span class="icon">
                  <IconCheck />
                </span>
                Corrigé disponible
              {/if}
            </span>
            {rest.title}
          </SubmenuItem>
        {/each}
        <SubmenuItem href="./create?type={type}" icon={null} subtext="Contribues à la Frappe ;)">
          Ajouter
        </SubmenuItem>
      </Submenu>
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

  .has-solution {
    display: flex;
    align-items: center;
  }

  .has-solution .icon {
    font-size: 1.2em;
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
