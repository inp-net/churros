<script lang="ts">
  import { DISPLAY_VISIBILITIES } from '$lib/display';
  import { Visibility } from '$lib/zeus';
  import IconLock from '~icons/mdi/lock-outline';
  import IconSchool from '~icons/mdi/school-outline';
  import IconCommunity from '~icons/mdi/account-group-outline';
  import IconLinkLock from '~icons/mdi/link-lock';
  import IconGlobe from '~icons/mdi/web';
  import { tooltip } from '$lib/tooltip';

  export let showTooltip = false;
  export let visibility: Visibility | undefined;
  export let text = false;
</script>

<span
  class="visibility"
  use:tooltip={showTooltip && visibility ? DISPLAY_VISIBILITIES[visibility] : undefined}
>
  {#if visibility === Visibility.Private}
    <IconLock />
  {:else if visibility === Visibility.Unlisted}
    <IconLinkLock />
  {:else if visibility === Visibility.GroupRestricted}
    <IconCommunity />
  {:else if visibility === Visibility.Public}
    <IconGlobe />
  {:else if visibility === Visibility.SchoolRestricted}
    <IconSchool></IconSchool>
  {/if}
  {#if text && visibility}
    {DISPLAY_VISIBILITIES[visibility]}
  {/if}
</span>

<style>
  .visibility {
    font-size: 1em;
  }
</style>
