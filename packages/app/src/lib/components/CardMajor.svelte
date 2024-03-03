<script lang="ts">
  import { fragment, graphql, type CardMajor } from '$houdini';
  import CardText from './CardText.svelte';

  export let href: string;

  export let major: CardMajor;
  $: Major = fragment(
    major,
    graphql`
      fragment CardMajor on Major {
        name
        shortName
      }
    `,
  );

  $: ({ name, shortName } = $Major);
</script>

<CardText {href}>
  <svelte:fragment slot="header">{shortName || name}</svelte:fragment>
  {#if shortName}
    {name}
  {/if}
</CardText>
