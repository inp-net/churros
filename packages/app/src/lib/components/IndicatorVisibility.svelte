<script lang="ts">
  import { DISPLAY_VISIBILITIES } from '$lib/display';
  import { Visibility } from '$lib/zeus';
  import IconLock from '~icons/mdi/lock-outline';
  import IconCommunity from '~icons/mdi/google-circles-extended';
  import IconLinkLock from '~icons/mdi/link-lock';
  import IconGlobe from '~icons/mdi/earth';

  export let visibility: Visibility | undefined;
</script>

<div class="visibility" title={visibility ? DISPLAY_VISIBILITIES[visibility] : undefined}>
  {#if visibility === Visibility.Private}
    <IconLock />
  {:else if visibility === Visibility.Unlisted}
    <IconLinkLock />
  {:else if visibility === Visibility.Restricted}
    <IconCommunity />
  {:else if visibility === Visibility.Public}
    <IconGlobe />
  {/if}
</div>
