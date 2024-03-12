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
        {#each questions as { title, mandatory, descriptionHtml, type, __typename, id, ...question } (id)}
          <article>
            <h3>{title}</h3>
            <div data-user-html="">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html descriptionHtml}
            </div>
            <pre>{type}</pre>
            {#if __typename === 'QuestionScalar'}
              {#if type === 'LongText'}
                <textarea name={id} {id} cols="30" rows="10"></textarea>
              {:else}
                <input type={type.toLowerCase()} name={id} {id} />
              {/if}
            {:else if ['QuestionSelectOne', 'QuestionSelectMultiple'].includes(__typename)}
              {#each question.options as option}
                <label for="{id}:{option}">
                  <input
                    type={type === 'SelectOne' ? 'radio' : 'checkbox'}
                    name={id}
                    id="{id}:{option}"
                    value={option}
                  />
                  {option}
                </label>
              {/each}
              {#if question.allowOptionsOther}
                <label for="{id}::other"
                  ><input
                    type={type === 'SelectOne' ? 'radio' : 'checkbox'}
                    name={id}
                    id="{id}::other"
                    value=""
                  />Autre
                  <input type="text" name="{id}::other-value" id="{id}::other-value" />
                </label>
              {/if}
            {:else if __typename === 'QuestionFileUpload'}
              <input type="file" name={id} {id} />
            {:else if __typename === 'QuestionScale'}
              <span class="label-min">{question.minimumLabel}</span>
              <input
                type="range"
                name={id}
                {id}
                min={question.minimum}
                max={question.maximum}
                step="1"
              />
              <span class="label-max">{question.maximumLabel}</span>
            {/if}
          </article>
        {/each}
      </section>
    {/each}
  </form>
{/if}
