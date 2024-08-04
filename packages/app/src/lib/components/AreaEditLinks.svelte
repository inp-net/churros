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
  // export let social = false;

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
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            message
            path
          }
        }
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
        ... on Error {
          message
        }
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
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            message
            path
          }
        }
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
  $: resourceId = ($data as typeof $data & { __typename: 'Event' | 'Article' })?.id;
  $: links = ($data as typeof $data & { __typename: 'Event' | 'Article' })?.links ?? [];
</script>

<slot name="toplabel">
  <p class="typo-field-label">Liens</p>
</slot>
<ul class="nobullet links">
  {#each links as link (link.id)}
    <li>
      <InputTextGhost
        on:blur={async ({ detail }) => {
          const result = await mutate(UpdateLink, {
            id: link.id,
            text: detail,
          });
          if (!result) return;
          toasts.mutation(result, 'updateLink', '', 'Impossible de changer le texte du lien');
        }}
        required
        placeholder="Texte affiché"
        label="Texte à afficher"
        value={link.text}
      />
      <InputTextGhost
        on:blur={async ({ detail }) => {
          const result = await mutate(UpdateLink, {
            id: link.id,
            url: detail,
          });
          if (!result) return;
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
            if (!result) return;
            toasts.mutation(result, 'deleteLink', '', 'Impossible de supprimer le lien');
          }}
        >
          <IconRemove />
        </ButtonGhost>
      </div>
    </li>
  {/each}
  <li class="new">
    <InputTextGhost
      placeholder="Texte affiché"
      label="Texte à afficher"
      bind:value={newLink.text}
    />
    <InputTextGhost placeholder="Lien" label="Adresse (URL)" type="url" bind:value={newLink.url} />
    <div class="action">
      <ButtonGhost
        loading={addingLink}
        on:click={async () => {
          if (typeof newLink === 'string') return;
          if (!newLink.text) return;
          if (!$data || !loaded(resourceId) || !allLoaded($data)) return;
          addingLink = true;
          const result = await mutate(
            AddLink,
            {
              resource: resourceId,
              links: [newLink],
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
          if (!result) return;
          if (toasts.mutation(result, 'addLinks', '', 'Impossible de rajouter le lien')) {
            newLink = {
              text: '',
              url: '',
            };
          }
        }}
      >
        <IconAdd />
      </ButtonGhost>
    </div>
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

  li {
    display: grid;
    grid-template-columns: 1fr 1fr max-content;
    gap: 0.5rem;
  }

  li > :last-child {
    font-size: 1.5rem;
  }
</style>
