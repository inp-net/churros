<script lang="ts">
  import { LoadingChurros } from '$lib/loading';

  export let title = 'Chargement…';
</script>

<div class="loading">
  <LoadingChurros />
  <p class="gradiented">{title}</p>
  <section class="regular-content">
    <slot></slot>
  </section>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    font-size: 7em;
  }

  .regular-content {
    font-size: calc(1em / 7);
  }

  .loading p.gradiented {
    margin-top: 1.5em;
    font-size: calc(1.5em * 1 / 7);
    font-weight: bold;
    background: linear-gradient(90deg, var(--fg), var(--primary), var(--fg));
    background-clip: text;
    -webkit-text-fill-color: transparent;
    /* stylelint-disable-next-line */
    text-fill-color: transparent;
    background-size: 200% auto;
    animation: textgradient 1s linear infinite reverse;
  }

  @keyframes textgradient {
    to {
      background-position: 200% center;
    }
  }
</style>
