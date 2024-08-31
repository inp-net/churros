<script lang="ts">
  import { fragment, graphql, type InputStudentEmail } from '$houdini';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { loading } from '$lib/loading';
  import Fuse from 'fuse.js';

  export let usingQuickSignupCode = false;
  export let label: string;
  export let value = '';

  export let major: InputStudentEmail | null;
  $: data = fragment(
    major,
    graphql(`
      fragment InputStudentEmail on Major @loading {
        schools {
          aliasMailDomains
          studentMailDomain
        }
      }
    `),
  );

  $: schoolMailDomains = ($data?.schools
    ?.flatMap((s) => [s.studentMailDomain, ...s.aliasMailDomains])
    .map((s) => loading(s, ''))
    .filter(Boolean) ?? []) as string[];

  $: nonSchoolMailDomains = [
    'gmail.com',
    'outlook.com',
    'yahoo.com',
    'hotmail.com',
    'live.com',
    'icloud.com',
    'me.com',
  ].filter((d) => !schoolMailDomains.includes(d));

  $: domain = value.split('@').at(1)?.toLowerCase();
  $: emailUsername = value.split('@').at(0)?.toLowerCase();
  $: suggestedSchoolMail = suggestedSchoolMailDomain
    ? `${emailUsername}@${suggestedSchoolMailDomain}`
    : '';
  $: isValidSchoolMail = domain && schoolMailDomains.includes(domain);
  $: suggestedSchoolMailDomain =
    // domain part exists
    domain &&
    // domain is not a known email provider
    !nonSchoolMailDomains.includes(domain) &&
    // domain is not a known school domain
    !schoolMailDomains.includes(domain) &&
    // domain is not too short
    domain.length > Math.min(...schoolMailDomains.map((d) => d.length)) * 0.5
      ? // domain fuzzily matches a known school domain
        (new Fuse(schoolMailDomains, {
          includeScore: true,
          threshold: 0.2,
          ignoreLocation: true,
          ignoreFieldNorm: true,
        })
          .search(domain)
          .at(0)?.item ?? false)
      : false;
</script>

<InputText
  {...$$restProps}
  {label}
  type="email"
  bind:value
  hintStyle={suggestedSchoolMailDomain ? 'warning' : isValidSchoolMail ? 'success' : 'muted'}
>
  <svelte:fragment slot="hint">
    {#if suggestedSchoolMailDomain}
      Ça ressemble à une e-mail universitaire en @{suggestedSchoolMailDomain}
      <ButtonInk
        insideProse
        on:click={() => {
          value = suggestedSchoolMail;
        }}
        >Utiliser
      </ButtonInk>
    {:else if isValidSchoolMail}
      {#if usingQuickSignupCode}
        <!-- All signups are auto validated when using quick signup codes, even w/o student mails. The other sentence would be misleading in that context -->
        Adresse e-mail universitaire valide
      {:else}
        Ton inscription sera automatiquement validée
      {/if}
    {:else if major}
      Si tu as accès à ton e-mail universitaire, utilise la
    {/if}
  </svelte:fragment>
</InputText>
