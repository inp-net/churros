<script lang="ts">
  import { page } from '$app/stores';

  let [componentName, slotContent] = $page.params['componentName'].split('/', 2);
  componentName = componentName.replaceAll('-', '/');
  let props = Object.fromEntries(
    Array(...$page.url.searchParams.entries()).map(([k, v]) => {
      let value;
      if (v === '') {
        value = true;
      } else {
        try {
          value = JSON.parse(v);
        } catch (e) {
          value = v;
        }
      }
      return [k, value];
    })
  );

  let title: string;
  $: {
    title = `<${componentName}`;
    if (Object.keys(props).length > 0) {
      title +=
        ' ' +
        Object.entries(props)
          .map(([k, v]) => (v === true ? k : `${k}=${JSON.stringify(v)}`))
          .join(' ');
    }
    if (slotContent) {
      title += `>${slotContent}</${componentName}>`;
    } else {
      title += '/>';
    }
  }

  let wireframe = false;
  let componentDomNode: HTMLElement;
  let newPropKey = '';
  let newPropValue = '';
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>
<main>
  <!-- <h1>{title}</h1> -->
  {#await import(`../../../lib/components/${componentName}.svelte`) then component}
    <main class:wireframe bind:this={componentDomNode}>
      {#if slotContent}
        <svelte:component this={component.default} {...props}>
          {slotContent}
        </svelte:component>
      {:else}
        <svelte:component this={component.default} {...props} />
      {/if}
    </main>
    <section class="props">
      {#each Object.entries(props) as [key, value] (key)}
        <label for={`prop-${key}`}
          >{key}
          <input id={`prop-${key}`} type="text" bind:value={props[key]} />
          <button on:click={() => delete props[key]}>del</button>
        </label>
      {/each}

      <div class="new-prop">
        <p>New prop</p>
        <input type="text" bind:value={newPropKey} />
        <input type="text" bind:value={newPropValue} />
        <button
          on:click={() => {
            props[newPropKey] = JSON.parse(newPropValue);
            newPropKey = '';
            newPropValue = '';
          }}>Add</button
        >
      </div>

      <label class="wireframe-toggle"
        >Show wireframe
        <input type="checkbox" bind:checked={wireframe} />
      </label>
    </section>
    {#if wireframe}
      <section class="info">
        <code
          >{componentDomNode?.getBoundingClientRect().width - 2} × {componentDomNode?.getBoundingClientRect()
            .height - 2}</code
        >
      </section>
    {/if}
  {:catch error}
    <section class="errored">
      <h2>Woops!</h2>
      <p>An error occured</p>
      <pre><code>{error}</code></pre>
    </section>
  {/await}
</main>

<style>
  section.errored {
    background: red;
    color: white;
    padding: 1em 2em;
    border-radius: 0.5em;
  }

  main.wireframe {
    border-color: black;
  }
  main {
    border: 1px solid transparent;
    display: inline-flex;
    box-sizing: content-box;
  }

  :global(body) {
    margin-bottom: 500px;
  }

  section.props {
    z-index: 1000000;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5em;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));
    gap: 1em;
    background: var(--bg);
  }

  section.props input {
    width: calc(100% - 100px);
  }
</style>
