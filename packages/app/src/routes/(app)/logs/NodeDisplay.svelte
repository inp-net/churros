<script lang="ts" context="module">
  export function hrefByTypename(disp: NodeDisplay | null): string {
    if (!disp) return '';
    const data = get(fragment(disp, new NodeDisplayStore()));
    if (!allLoaded(data)) return '';
    if (['User', 'Group'].includes(data.__typename as string)) {
      // @ts-expect-error User and Group are not part of data.__typename's type, somehow
      return route('/[uid=uid]', data.uid ?? '');
    }
    switch (data.__typename) {
      case 'Announcement':
        return route('/announcements');
      case 'Article':
        return route('/posts/[id]', data.localID ?? '');
      case 'Document':
        // TODO
        return route('/documents');
      case 'Event':
        return route('/events/[id]', data.localID ?? '');
      case 'EventManager':
        return route('/events/[id]/edit/managers', data.event.localID ?? '');
      case 'EventManagerInvite':
        return route('/events/[id]/edit/managers', data.event.localID ?? '');
      case 'LydiaAccount':
        if (!data.group) return '';
        return route('/groups/[uid]/edit/bank-accounts', data.group.uid ?? '');
      case 'Minor':
        return route('/documents/[major]', data.majors[0].uid ?? '');
      case 'QuickSignup':
        return route('/quick-signups/qr/[code]', data.code ?? '');
      case 'Reaction':
        // TODO?
        return '';
      case 'Registration':
        return route('/bookings/[code]', data.code ?? '');
      case 'Service':
        return data.url ?? '';
      case 'Theme':
        return '';
      case 'Ticket':
        return route('/events/[id]/edit/tickets/[ticket]', {
          id: data.event.localID ?? '',
          ticket: data.localID ?? '',
        });
      case 'TicketGroup':
        return route('/events/[id]/edit/ticket-groups/[group]', {
          id: data.event.localID ?? '',
          group: data.localID ?? '',
        });
      case 'UserCandidate':
        return route('/signups/edit/[email]', data.email ?? '');
      default:
        return '';
    }
  }
</script>

<script lang="ts">
  import { 
    fragment, 
    graphql, 
    NodeDisplayStore, 
    type NodeDisplay 
  } from '$houdini';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { allLoaded, type MaybeLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { get } from 'svelte/store';
  import LogoLydia from '~icons/custom-logos/lydia';
  import IconAnnouncement from '~icons/msl/campaign-outline';
  import IconEvent from '~icons/msl/event-outline';
  import IconDocument from '~icons/msl/file-copy-outline';
  import IconScanQR from '~icons/msl/qr-code-scanner';
  import IconTicket from '~icons/msl/receipt-long-outline';
  import IconBooking from '~icons/msl/shoppingmode-outline';
  import IconPost from '~icons/msl/text-ad-outline';
  import IconUserCandidate from '~icons/msl/user-attributes-outline';

  export let fallback: MaybeLoading<string> = '';
  export let data: NodeDisplay | null | undefined;
  $: Node = fragment(
    data,
    graphql(`
      fragment NodeDisplay on Node @loading {
        localID
        __typename
        ... on User {
          uid
          ...AvatarUser
        }
        ... on Group {
          uid
          ...AvatarGroup
        }
        ... on Announcement {
          title
        }
        ... on Event {
          title
        }
        ... on Article {
          title
        }
        ... on Document {
          title
        }
        ... on EventManager {
          user {
            ...AvatarUser
          }
          event {
            localID
            title
          }
        }
        ... on EventManagerInvite {
          maybeCode: code
          event {
            localID
            title
          }
        }
        ... on LydiaAccount {
          name
          group {
            uid
          }
        }
        ... on Minor {
          name
          majors {
            uid
          }
        }
        ... on QuickSignup {
          code
          school {
            uid
          }
        }
        ... on Reaction {
          emoji
          author {
            uid
          }
          subject {
            id
          }
        }
        ... on Registration {
          code
          ticket {
            event {
              title
            }
          }
        }
        ... on Service {
          name
          url
        }
        ... on Theme {
          name
        }
        ... on Ticket {
          name
          localID
          event {
            localID
            title
          }
        }
        ... on TicketGroup {
          name
          localID
          event {
            localID
            title
          }
        }
        ... on UserCandidate {
          email
          uid
        }
      }
    `),
  );
</script>

<div class="node-display">
  {#if !$Node || !allLoaded($Node)}
    <LoadingText value={fallback} />
  {:else if $Node.__typename === 'User'}
    <AvatarUser href="" name user={$Node} />
  {:else if $Node.__typename === 'Group'}
    <AvatarGroup href="" group={$Node} />
  {:else if $Node.__typename === 'EventManager'}
    <IconEvent />
    Manager <AvatarUser href="" name user={$Node.user} /> on {$Node.event.title}
  {:else if $Node.__typename === 'EventManagerInvite'}
    Invite {$Node.maybeCode} for {$Node.event.title}
  {:else if $Node.__typename === 'Reaction'}
    {$Node.emoji} by {$Node.author?.uid ?? '<deleted>'} on {$Node.subject?.id ?? ''}
  {:else if $Node.__typename === 'Registration'}
    <IconBooking />
    {$Node.code} for {$Node.ticket.event.title}
  {:else if $Node.__typename === 'LydiaAccount'}
    <LogoLydia />
    {$Node.name} in {$Node.group?.uid ?? '<no group>'}
  {:else if $Node.__typename === 'UserCandidate'}
    <IconUserCandidate />
    candidate {$Node.uid} &lt;{$Node.email}&gt;
  {:else if $Node.__typename === 'Minor'}
    minor {$Node.name}
  {:else if $Node.__typename === 'Service'}
    service {$Node.name} (<a href={$Node.url}>{$Node.url}</a>)
  {:else if $Node.__typename === 'Theme'}
    theme {$Node.name}
  {:else if $Node.__typename === 'Ticket'}
    <IconTicket />
    {$Node.name} for {$Node.event.title}
  {:else if $Node.__typename === 'TicketGroup'}
    <IconTicket />
    group {$Node.name} for {$Node.event.title}
  {:else if $Node.__typename === 'Announcement'}
    <IconAnnouncement />
    {$Node.title}
  {:else if $Node.__typename === 'Article'}
    <IconPost />
    {$Node.title}
  {:else if $Node.__typename === 'Document'}
    <IconDocument />
    {$Node.title}
  {:else if $Node.__typename === 'Event'}
    <IconEvent />
    {$Node.title}
  {:else if $Node.__typename === 'QuickSignup'}
    <IconScanQR />
    signup {$Node.code} for {$Node.school.uid}
  {:else if 'title' in $Node}
    {$Node.title}
  {:else}
    {$Node.__typename} {$Node.localID}
  {/if}
</div>

<style>
  .node-display {
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
</style>
