<script lang="ts">
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { tooltip } from '$lib/tooltip';

  export let open: () => void;
</script>

<ModalOrDrawer tall title="Aide sur markdown" bind:open>
  <div class="content">
    <div class="side-by-side muted legend">
      <span>Écris…</span>
      <span>Pour obtenir…</span>
    </div>
    <!-- <h2>Gras, italique, etc.</h2> -->
    <div class="side-by-side">
      <code class="markdown-code">**gras**</code>
      <span data-user-html><strong>gras</strong></span>
      <code class="markdown-code">_italique_</code>
      <span data-user-html><em>italique</em></span>
      <code class="markdown-code">`code`</code>
      <span data-user-html><code>code</code></span>
      <code class="markdown-code" use:tooltip={'Syntaxe LaTeX'}>${`\\frac{2}{\\pi}`}$</code>
      <span data-user-html class="katex" use:tooltip={'Syntaxe LaTeX'}>
        <span class="katex-mathml"
          ><math xmlns="http://www.w3.org/1998/Math/MathML"
            ><semantics
              ><mrow><mfrac><mi>π</mi><mn>2</mn></mfrac></mrow><annotation
                encoding="application/x-tex">{`\\frac{\\pi}{2}`}</annotation
              ></semantics
            ></math
          ></span
        ><span class="katex-html" aria-hidden="true"
          ><span class="base"
            ><span class="strut" style="height:1.0404em;vertical-align:-0.345em;"></span><span
              class="mord"
              ><span class="mopen nulldelimiter"></span><span class="mfrac"
                ><span class="vlist-t vlist-t2"
                  ><span class="vlist-r"
                    ><span class="vlist" style="height:0.6954em;"
                      ><span style="top:-2.655em;"
                        ><span class="pstrut" style="height:3em;"></span><span
                          class="sizing reset-size6 size3 mtight"
                          ><span class="mord mtight"><span class="mord mtight">2</span></span></span
                        ></span
                      ><span style="top:-3.23em;"
                        ><span class="pstrut" style="height:3em;"></span><span
                          class="frac-line"
                          style="border-bottom-width:0.04em;"
                        ></span></span
                      ><span style="top:-3.394em;"
                        ><span class="pstrut" style="height:3em;"></span><span
                          class="sizing reset-size6 size3 mtight"
                          ><span class="mord mtight"
                            ><span class="mord mathnormal mtight" style="margin-right:0.0359em;"
                              >π</span
                            ></span
                          ></span
                        ></span
                      ></span
                    ><span class="vlist-s">&#x200b;</span></span
                  ><span class="vlist-r"
                    ><span class="vlist" style="height:0.345em;"><span></span></span></span
                  ></span
                ></span
              ><span class="mclose nulldelimiter"></span></span
            ></span
          ></span
        ></span
      >
      <code class="markdown-code">[lien](https://net7.dev)</code>
      <span><a href="https://net7.dev" class="in-body">lien</a></span>
    </div>
    <!-- <h2>Titres</h2> -->
    <div class="side-by-side">
      <code class="markdown-code"># Titre</code>
      <span data-user-html><h3>Titre</h3></span>
      <code class="markdown-code">## Sous-titre</code>
      <span data-user-html><h4>Sous-titre</h4></span>
      <code class="markdown-code">### Sous-sous titre</code>
      <span data-user-html><h5>Sous-sous titre</h5></span>
    </div>
    <!-- <h2>Listes</h2> -->
    <div class="side-by-side">
      <pre class="markdown-code">
- Un
- Deux
- Trois
        </pre>
      <div data-user-html>
        <ul>
          <li>Un</li>
          <li>Deux</li>
          <li>Trois</li>
        </ul>
      </div>
      <pre class="markdown-code">
1. Un
1. Deux
6. Trois
        </pre>
      <div data-user-html>
        <ol>
          <li>Un</li>
          <li>Deux</li>
          <li>Trois</li>
        </ol>
      </div>
    </div>
    <h2>En savoir plus</h2>
    <p>
      <a href="https://daringfireball.net/projects/markdown/syntax"
        >Article du créateur de markdown</a
      >
    </p>
  </div>
</ModalOrDrawer>

<style>
  code {
    font-weight: normal;
  }

  .markdown-code {
    font-size: 0.8em;
  }

  .side-by-side {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    align-items: center;
  }

  .side-by-side.legend {
    font-size: 1.2em;
    border-bottom: var(--border-block) solid var(--bg3);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>
