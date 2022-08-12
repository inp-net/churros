<script lang="ts">
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsMenu from '~icons/majesticons/menu';

  export let openness = 0;

  $: title = openness >= 0.5 ? 'Bouton de fermeture du menu' : "Bouton d'ouverture du menu";
</script>

<button on:click {title}>
  <MajesticonsClose
    style="color: var(--text); opacity: {openness}"
    class="absolute"
    aria-label={openness >= 0.5 ? 'Bouton de fermeture du menu' : "Bouton d'ouverture du menu"}
  />
  <MajesticonsMenu aria-hidden="true" />
</button>

<style lang="scss">
  button {
    all: unset;
    padding: 0.25rem;
    color: var(--primary-text);
    border-radius: var(--radius-inline);
    outline: 0 solid var(--ring);

    &:active {
      box-shadow: none;
    }

    &:focus-visible {
      outline: 4px solid var(--ring);
    }

    > :global(svg) {
      width: 3rem;
      height: 3rem;
    }
  }
</style>
