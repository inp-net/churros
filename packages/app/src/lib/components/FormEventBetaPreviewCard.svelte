<script lang="ts">
  export let title: string = '';
  export let description: string = '';
  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;
  export let location: string = '';
</script>

<article class="preview-card">
  <img alt="Pas de miniature" class="thumb" />
  <p class:empty={!title} class="title">{title || 'Pas de titre'}</p>
  <div class:empty={!description} class="description" data-user-html="">
    {description || 'Sans description'}
  </div>
</article>

<style>
  article {
    width: 300px;
    height: 500px;
    border-radius: var(--radius-block);
    background-color: var(--muted-bg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    gap: 1rem;
  }

  article img {
    width: 100%;
    height: 150px;
    background: #000;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  article > *:not(img) {
    padding: 0 1rem;
  }

  article .title {
    font-size: 1.2em;
    font-weight: bold;
  }

  article *.empty {
    color: var(--muted-text);
  }
</style>
