<script lang="ts">
  import { fragment, graphql, type AreaEditLinks } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import { allLoaded, loaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconAdd from '~icons/msl/add-circle-outline';
  import IconRemove from '~icons/msl/do-not-disturb-on-outline';

  /** The area is meant to edit Social links. The link name cannot be edited, but is instead inferred from the URL itself to the social network's name, or the domain name when it cannot be inferred. */
  export let social = false;

  let newLink = {
    text: '',
    url: '',
  };

  const AddLink = graphql(`
    mutation AddLink($resource: ID!, $links: [LinkInput!]!) {
      addLinks(id: $resource, links: $links) {
        __typename
        ... on MutationAddLinksSuccess {
          data {
            ...AreaEditLinks
          }
        }
        ...MutationErrors
      }
    }
  `);

  const RemoveLink = graphql(`
    mutation RemoveLink($link: LocalID!) {
      deleteLink(id: $link) {
        __typename
        ... on MutationDeleteLinkSuccess {
          data {
            id @Link_delete
          }
        }
        ...MutationErrors
      }
    }
  `);

  const UpdateLink = graphql(`
    mutation UpdateLink($id: LocalID!, $text: String, $url: LooseURL) {
      updateLink(id: $id, text: $text, url: $url) {
        __typename
        ... on MutationUpdateLinkSuccess {
          data {
            ...AreaEditLinks_Link
          }
        }
        ...MutationErrors
      }
    }
  `);

  export let resource: AreaEditLinks | null;
  $: data = fragment(
    resource,
    graphql(`
      fragment AreaEditLinks on HasLinks @loading {
        __typename
        ... on Event {
          id
          links @list(name: "AreaEditLinks_EventLinks") {
            ...AreaEditLinks_Link @mask_disable
          }
        }
        ... on Article {
          id
          links @list(name: "AreaEditLinks_ArticleLinks") {
            ...AreaEditLinks_Link @mask_disable
          }
        }
        ... on Ticket {
          id
          links @list(name: "AreaEditLinks_TicketLinks") {
            ...AreaEditLinks_Link @mask_disable
          }
        }
        ... on User {
          id
          links @list(name: "AreaEditLinks_UserLinks") {
            ...AreaEditLinks_Link @mask_disable
          }
        }
        ... on Group {
          id
          links @list(name: "AreaEditLinks_GroupLinks") {
            ...AreaEditLinks_Link @mask_disable
          }
        }
      }
    `),
  );
  graphql(`
    fragment AreaEditLinks_Link on Link @loading {
      id
      url
      rawURL
      text
    }
  `);

  let addingLink = false;
  $: resourceId = ($data as typeof $data & { __typename: 'Ticket' | 'Event' | 'Article' | 'User' })
    ?.id;
  $: links =
    ($data as typeof $data & { __typename: 'Ticket' | 'Event' | 'Article' | 'User' })?.links ?? [];
</script>

<slot name="toplabel">
  <p class="typo-field-label">Liens</p>
</slot>
<ul class="nobullet links" class:social>
  {#each links as link (link.id)}
    <li>
      {#if !social}
        <InputTextGhost
          on:blur={async ({ detail }) => {
            const result = await mutate(UpdateLink, {
              id: link.id,
              text: detail,
            });
            toasts.mutation(result, 'updateLink', '', 'Impossible de changer le texte du lien');
          }}
          required
          placeholder="Texte affiché"
          label="Texte à afficher"
          value={link.text}
        />
      {/if}
      <InputTextGhost
        on:blur={async ({ detail }) => {
          const result = await mutate(UpdateLink, {
            id: link.id,
            url: detail,
          });
          toasts.mutation(result, 'updateLink', '', "Impossible de changer l'adresse du lien");
        }}
        required
        placeholder="Lien"
        label="Adresse (URL)"
        type="url"
        value={link.rawURL}
      />
      <div class="action">
        <ButtonGhost
          on:click={async () => {
            const result = await mutate(
              RemoveLink,
              {
                link: link.id,
              },
              {
                optimisticResponse: {
                  deleteLink: {
                    __typename: 'MutationDeleteLinkSuccess',
                    data: {
                      id: link.id,
                    },
                  },
                },
              },
            );
            toasts.mutation(result, 'deleteLink', '', 'Impossible de supprimer le lien');
          }}
        >
          <IconRemove />
        </ButtonGhost>
      </div>
    </li>
  {/each}
  <li class="new">
    <form
      on:submit|preventDefault={async () => {
        if (!$data || !loaded(resourceId) || !allLoaded($data)) return;
        addingLink = true;
        const result = await mutate(
          AddLink,
          {
            resource: resourceId,
            links: [social ? { url: newLink.url, text: newLink.url } : newLink],
          },
          // {
          // FIXME: makes everything reload briefly, dunno why
          //   optimisticResponse: {
          //     addLinks: {
          //       __typename: 'MutationAddLinksSuccess',
          //       data: {
          //         ...$data,
          //         id: resourceId,
          //         links: [...links, newLink],
          //       },
          //     },
          //   },
          // },
        );
        addingLink = false;
        if (!result) return;
        if (toasts.mutation(result, 'addLinks', '', 'Impossible de rajouter le lien')) {
          newLink = {
            text: '',
            url: '',
          };
        }
      }}
    >
      {#if !social}
        <InputTextGhost
          placeholder="Texte affiché"
          label="Texte à afficher"
          bind:value={newLink.text}
        />
      {/if}
      <InputTextGhost
        placeholder="Lien"
        label="Adresse (URL)"
        type="url"
        required
        bind:value={newLink.url}
      />
      <div class="action">
        <ButtonGhost loading={addingLink} type="submit">
          <IconAdd />
        </ButtonGhost>
      </div>
    </form>
  </li>
</ul>

<style>
  p.typo-field-label {
    --weight-field-label: 800;
  }

  .links {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
  }

  li:not(.new),
  li.new form {
    display: grid;
    grid-template-columns: 1fr 1fr max-content;
    gap: 0.5rem;
  }

  li.new,
  li.new form {
    align-items: center;
    width: 100%;
  }

  li.new form {
    font-size: 1rem;
  }

  .social li:not(.new),
  .social li.new form {
    grid-template-columns: 1fr max-content;
  }

  li > :last-child,
  li.new form > :last-child {
    font-size: 1.5rem;
  }
</style>
