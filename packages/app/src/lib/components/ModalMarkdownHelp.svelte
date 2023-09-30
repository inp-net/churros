<script lang="ts">
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';
  import Modal from './Modal.svelte';

  export let element: HTMLDialogElement;
</script>

<Modal bind:element>
  <div class="content">
    <h1>
      Aide sur Markdown

      <ButtonGhost
        on:click={() => {
          element.close();
        }}><IconClose /></ButtonGhost
      >
    </h1>
    <h2>Gras, italique, etc.</h2>
    <div class="side-by-side">
      <code class="markdown-code">**gras**</code>
      <span><strong>gras</strong></span>
      <code class="markdown-code">_italique_</code>
      <span><em>italique</em></span>
      <code class="markdown-code">`code`</code>
      <span><code>code</code></span>
      <code class="markdown-code">${`\\frac{2}{\\pi}`}$</code>
      <span class="katex">
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
    <h2>Titres</h2>
    <div class="side-by-side">
      <code class="markdown-code"># Titre</code>
      <span><h3>Titre</h3></span>
      <code class="markdown-code">## Sous-titre</code>
      <span><h4>Sous-titre</h4></span>
      <code class="markdown-code">### Sous-sous titre</code>
      <span><h5>Sous-sous titre</h5></span>
    </div>
    <h2>Listes</h2>
    <div class="side-by-side">
      <pre class="markdown-code">
- Un
- Deux
- Trois
        </pre>
      <div>
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
      <div>
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
</Modal>

<style>
  h1 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

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

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
