<script lang="ts">
  import { LinkType } from '$lib/zeus';
  import SimpleIconsFacebook from '~icons/simple-icons/facebook';
  import SimpleIconsInstagram from '~icons/simple-icons/instagram';
  import SimpleIconsTelegram from '~icons/simple-icons/telegram';
  import SimpleIconsTwitter from '~icons/simple-icons/twitter';

  export let type: LinkType;
  export let value: string;
</script>

<a href={value}>
  {#if type === LinkType.Facebook}
    <SimpleIconsFacebook />
  {:else if type === LinkType.Instagram}
    <SimpleIconsInstagram />
  {:else if type === LinkType.Telegram}
    <SimpleIconsTelegram />
  {:else if type === LinkType.Twitter}
    <SimpleIconsTwitter />
  {:else}
    {type}
  {/if}
</a>
