<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

{#if !data.form}
  <p>Chargement…</p>
{:else}
  {@const { title, descriptionHtml, sections } = data.form}
  <form action="">
    <h1>{title}</h1>
    <div data-user-html="">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html descriptionHtml}
    </div>
    {#each sections as { title, descriptionHtml, questions, id } (id)}
      <section>
        {#if title}
          <h2>{title}</h2>
          <div data-user-html="">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html descriptionHtml}
          </div>
        {/if}
        {#each questions as { title, mandatory, descriptionHtml, type, id, ...question } (id)}
          <article>
            <h3>{title}</h3>
            <div data-user-html="">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html descriptionHtml}
            </div>
            <pre>{type}</pre>
            {#if type === 'Text'}
              <input type="text" name={id} {id} />
            {:else if type === 'LongText'}
              <textarea name={id} {id} cols="30" rows="10"></textarea>
            {:else if question.__typename === 'QuestionSelectOne' && question.options}
              {#each question.options as option}
                <input type="radio" name={id} {id} value={option} />
              {/each}
              {#if question.allowOptionsOther}
                <input type="radio" name={id} {id} value="" />
                <input type="text" name="" id="" />
              {/if}
            {/if}
          </article>
        {/each}
      </section>
    {/each}
  </form>
{/if}
