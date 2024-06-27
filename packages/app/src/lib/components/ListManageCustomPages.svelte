<script lang="ts">
  import {
    graphql,
    paginatedFragment,
    type ListManageCustomPages_Group,
    type ListManageCustomPages_StudentAssociation,
  } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Card from '$lib/components/Card.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { loaded, loading, onceLoaded } from '$lib/loading';
  import { notNull } from '$lib/typing';
  import IconSee from '~icons/mdi/eye-outline';
  import IconEdit from '~icons/mdi/pencil-outline';

  export let group: ListManageCustomPages_Group | null = null;
  $: Group = paginatedFragment(
    group,
    graphql(`
      fragment ListManageCustomPages_Group on Group {
        pages(first: 10) @paginate {
          edges @list(name: "List_GroupPages") {
            node {
              id
              path
              title
            }
          }
        }
      }
    `),
  );

  export let studentAssociation: ListManageCustomPages_StudentAssociation | null = null;
  $: StudentAssociation = paginatedFragment(
    studentAssociation,
    graphql(`
      fragment ListManageCustomPages_StudentAssociation on StudentAssociation {
        pages(first: 10) @paginate {
          edges @list(name: "List_StudentAssociationPages") {
            node {
              id
              path
              title
            }
          }
        }
      }
    `),
  );

  $: pages =
    $StudentAssociation.data || $Group.data
      ? ($StudentAssociation.data ?? $Group.data)!.pages.edges.map((e) => e?.node).filter(notNull)
      : [];
</script>

<ul class="nobullet">
  {#each pages as page}
    {#if page}
      <Card
        class="page-item"
        element="li"
        href={onceLoaded(page.path, (path) => `./${path}`, `#${loading(page.id, '')}`)}
      >
        <div class="text">
          <p>
            <code><LoadingText value={page.path}>lorem-ipsum-dolor-sit-amet</LoadingText> </code>
          </p>
          <h2><LoadingText value={page.title}>Lorem ipsum dolor sit amet</LoadingText></h2>
        </div>
        <div class="actions">
          <ButtonSecondary
            disabled={!loaded(page.path)}
            icon={IconEdit}
            href={onceLoaded(page.path, (path) => `./${path}`, '')}>Modifier</ButtonSecondary
          >
          <ButtonSecondary
            disabled={!loaded(page.path)}
            icon={IconSee}
            href={onceLoaded(page.path, (path) => `../../${path}`, '')}>Voir</ButtonSecondary
          >
        </div>
      </Card>
    {/if}
  {/each}
</ul>

<style>
  ul :global(.card-content) {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }
</style>
