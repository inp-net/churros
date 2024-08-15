<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import { ButtonInk } from '$lib/components';
  import InputText from '$lib/components/InputText.svelte';
  import Fuse from 'fuse.js';

  export let usingQuickSignupCode = false;
  export let label: string;
  export let value = '';

  export let validationData;
  $: data = fragment(
    validationData,
    graphql(`
      fragment InputStudentEmail on Query {
        schools {
          aliasMailDomains
          studentMailDomain
        }
      }
    `),
  );

  $: schoolMailDomains = $data.schools
    .flatMap((s) => [s.studentMailDomain, ...s.aliasMailDomains])
    .filter(Boolean);

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
  hintStyle={suggestedSchoolMailDomain
    ? 'warning'
    : isValidSchoolMail && !usingQuickSignupCode
      ? 'success'
      : 'muted'}
  hint={suggestedSchoolMailDomain
    ? `Ça ressemble à une e-mail universitaire en @${suggestedSchoolMailDomain}`
    : // with a quicksignup code, everything is automatically validated,
      // we don't want to confuse users who'll look at their friend's screen
      // and see a green checkmark while they don't have one
      isValidSchoolMail && !usingQuickSignupCode
      ? 'Ton inscription sera automatiquement validée'
      : 'Si tu en as une, et que tu y as accès, utilise ton adresse e-mail universitaire'}
>
  <span class="apply-suggestion" slot="hint">
    {#if suggestedSchoolMailDomain}
      <ButtonInk
        insideProse
        on:click={() => {
          value = suggestedSchoolMail;
        }}
        >Utiliser
      </ButtonInk>
    {/if}
  </span>
</InputText>
