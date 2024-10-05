<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fragment, graphql, type TreePersons } from '$houdini';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import { allLoaded, loading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import cytoscape from 'cytoscape';
  type Nesting = [string, Nesting[]];

  export let user: TreePersons | null = null;
  $: data = fragment(
    user,
    graphql(`
      fragment TreePersons on User @loading {
        uid
        familyTree {
          nesting
          users {
            uid
            fullName
            pictureURL
          }
        }
      }
    `),
  );

  let wrapperElement: HTMLDivElement;
  let containerElement: HTMLDivElement;
  function renderTree(wrapper: HTMLDivElement, container: HTMLDivElement, nesting: Nesting) {
    const nodes: Array<{ data: { id: string; name: string } }> = [];
    const edges: Array<{ data: { source: string; target: string } }> = [];

    function fillTree([parent, children]: Nesting) {
      if (!$data) return;
      const user = $data.familyTree.users.find((u) => u.uid === parent)!;
      nodes.push({ data: { id: parent, name: loading(user?.fullName, '') } });
      for (const [child, subchildren] of children) {
        edges.push({ data: { source: parent, target: child } });
        fillTree([child, subchildren]);
      }
    }

    fillTree(nesting);

    const style = cytoscape
      // @ts-expect-error typing of cytoscape sucks
      .stylesheet()
      .selector('node')
      .style({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'background-image': (node: any) => route('GET /[uid=uid].png', node.data('id')),
        'background-fit': 'cover',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'border-color': (node: any) =>
          node.data('id') === $data?.uid
            ? getComputedStyle(document.documentElement).getPropertyValue('--primary')
            : getComputedStyle(document.documentElement).getPropertyValue('--shy'),
        'border-width': '2px',
        'border-opacity': 0.8,
        'label': 'data(name)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': '5px',
        'color': getComputedStyle(document.documentElement).getPropertyValue('--text'),
        'width': '50px',
        'height': '50px',
      })
      .selector('edge')
      .css({
        'curve-style': 'bezier',
        'width': 3,
        'target-arrow-shape': 'triangle',
        'line-color': '#aaa',
        'target-arrow-color': '#aaa',
      });

    const cy = cytoscape({
      container,
      boxSelectionEnabled: false,
      userZoomingEnabled: false,
      minZoom: 0.1,
      maxZoom: 1,
      elements: {
        nodes: nodes,
        edges: edges,
      },
      style,
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 0,
        spacingFactor: 1.7,
      },
    }); // cy init

    // Si l'arbre est trop grand on lui laisse plus de place
    const maxZoom = Math.min(
      wrapper.getBoundingClientRect().width / container.getBoundingClientRect().width,
      wrapper.getBoundingClientRect().height / container.getBoundingClientRect().height,
    );
    const zoom = Math.min(maxZoom, 1 / cy.zoom());
    container.style.width = `${cy.width() * zoom}px`;
    container.style.height = `${cy.height() * zoom}px`;
    cy.resize();
    cy.fit();
    cy.center();

    cy.on('click', 'node', async (el) => {
      const uid = el.target.data('id');
      if (uid === $data?.uid) return;
      await goto(
        refroute('/[uid=uid]', uid, {
          tab: 'family',
        }),
      );
    });
  }

  $: if (browser && wrapperElement && containerElement && allLoaded($data) && $data)
    renderTree(wrapperElement, containerElement, JSON.parse($data.familyTree.nesting));
</script>

{#if allLoaded($data)}
  <div class="wrapper" bind:this={wrapperElement}>
    <div class="container" bind:this={containerElement}></div>
  </div>
{:else}
  <LoadingChurros />
{/if}

<style>
  .wrapper {
    width: 100%;
    height: 600px;
  }

  .container {
    width: 100%;
    height: 100%;
  }
</style>
