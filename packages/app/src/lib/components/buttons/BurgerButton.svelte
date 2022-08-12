<script lang="ts">
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsMenu from '~icons/majesticons/menu';

  export let openness = 0;
</script>

<button on:click>
  <MajesticonsClose
    width="3rem"
    height="3rem"
    style="color: var(--text); opacity: {openness}"
    class="absolute"
  />
  <MajesticonsMenu width="3rem" height="3rem" />
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
  }
</style>
