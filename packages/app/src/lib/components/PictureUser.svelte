<script lang="ts">
  export let src: string | undefined;
  export let alt: string;
  export let width = 160;
  export let height = 160;
</script>

<img {src} {alt} {width} {height} loading="lazy" on:load />

<style lang="scss">
  img {
    border-radius: var(--radius-inline);
    box-shadow: var(--shadow);
  }
</style>
