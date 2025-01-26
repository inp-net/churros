# @churros/app

## 4.1.2

### Patch Changes

- 10c907b: dedupe & reorder sections in event managers page

## 4.1.1

### Patch Changes

- 2aadf87: chore(deps): update dependency @babel/core to ^7.26.7 (!415)
- 2aadf87: fix(deps): update dependency @carbon/charts-svelte to ^1.22.15 (!391)
- 2aadf87: chore(deps): update dependency @iconify-json/material-symbols to ^1.2.13 (!410)
- 6cdab09: chore(deps): update dependency @iconify-json/material-symbols-light to ^1.2.13 (!416)
- 2aadf87: chore(deps): update dependency @iconify-json/mdi to ^1.2.3 (!417)
- 6cdab09: chore(deps): update dependency @iconify-json/simple-icons to ^1.2.21 (!418)
- 2aadf87: fix(deps): update dependency @sentry/sveltekit to ^8.51.0 (!403)
- 84a508a: chore(deps): update dependency @sveltejs/adapter-node to ^5.2.12 (!419)
- 3af8ad0: changelogs now include dependency updates
- Updated dependencies [6cdab09]
  - arborist@0.1.3

## 4.1.0

### Minor Changes

- d46f5c7: redesign signups management page
- 89f386f: allow users to delete their accounts
- 5880beb: allow hiding capacity on tickets
- a09feb9: add point of contacts on event (see #1229), allow specifying authorName when booking an event while loggedout (see #1209)
- 072d7f5: add event manager invite links system
- 1cd5f3d: Redesign /backrooms
- 8f63ff5: show event managers inherited from group memberships
- a50aec4: redesign announcements management pages
- 7be2de4: disallow some visibilities when an event has tickets open to external users. reflect this clearly in the UI too
- 92a434c: clarify when someone can see places left and/or capacity of a ticket because they are managers
- 2aebc49: allow search for bookings in /event/:id/bookings
- ff0a9a9: show red dot on backrooms overflow menu item when there are pending signups

### Patch Changes

- a09feb9: CSV bookings export download button did not work in OAuth2-based sessions (see #1216)
- a09feb9: payment method showed "undefined" when not yet selected (see #1094)
- 0d0b17a: hide red dot from overflow menu if item that adds it is hidden and/or disabled
- a9fe207: all inputs had autofocus

## 4.0.0

### Major Changes

- a451d73: remove /reports/ pages, remove code contributors from /credits
- 50ffbd7: remove comments

### Minor Changes

- 896707d: The checks.websocket property of /health's response is always true and is now deprecated
- df8fb24: Redesign /backrooms
- df8fb24: show red dot on backrooms overflow menu item when there are pending signups

### Patch Changes

- 7f63be5: fix group member list infinite scroll
- f791fd5: toast using callbacks or labels triggered Svelte warnings about unknown props in console
- df8fb24: /kiosk should now work even on devices without websocket support

## 3.1.0

### Minor Changes

- 893dbc8: Add GDPR data export
- 85bc631: add themes management
- 4589b01: allow tickets to be accessed via invitation links only
- 45d7615: allow setting 4th yeartier on graduation year constraint (closes #1194)
- 93f7dd6: allow users to set their pronouns

### Patch Changes

- a0b3b27: clicking Voir plus on event cards would cause a double navigation to the event detail page
- e1262b7: upgrade dependencies
- Updated dependencies [e1262b7]
  - arborist@0.1.2

## 3.0.1

### Patch Changes

- 45962da: make services in quick access list actually clickable

## 3.0.0

### Major Changes

- bba3e47: Remove /posts/:group/create - the URL was not used anywhere in the UI anymore

### Minor Changes

- 02fa1a0: allow hiding capacity on tickets
- f09cd52: fix and improve email change request flow (wording in email, appearance of error state, and making request creating actually work)
- a73ec69: redesign quick signups management pages
- 02fa1a0: show event managers inherited from group memberships
- 0453154: fix(signup): force opening major picker before anything else (closes #1190)
- 02fa1a0: clarify when someone can see places left and/or capacity of a ticket because they are managers
- aee5a3a: make repository url to the churros repo env-configurable, defaults to https://git.inpt.fr/churros/churros

### Patch Changes

- 11d9947: fix(permissions): make documents access toggle actually trigger the mutation (fixes #1228)
- b616da1: fix borked infinite scroll on /events/:id/bookings
- eecc2c9: clarify what the date range headers are in group members list page
- 6e11d67: make bookmarked services actually clickable
- bba3e47: make delete button on posts work
- 0453154: don't trigger form submissions when picking an option in a modal picker
- 6e11d67: improve help message for empty state of bookmarks list

## 2.13.0

### Minor Changes

- aceb9af: fix(profile): make group members link point to group/user pages instead of group member edition modal
- 4f87c5e: improve groups' Lydia accounts management and fix bugs
- fb45fa1: feat(app): improve skeleton UI appearance

### Patch Changes

- 0c84def: fix(app): date inputs were sometimes not editable

## 2.12.1

### Patch Changes

- 3d36801: fix(app): buttons could not be clicked on on mobile

## 2.12.0

### Minor Changes

- 620291b: improve services UI
- 4f8eb7d: rework group members UI
- d95e254: feat(profile): enlarge picture on click
- 51dec97: add link to code claim page on settings
- db1451e: feat(search): implement showing rank & similarity values in debug mode

### Patch Changes

- f03b7cf: fix(posts): le body d'un post n'est jamais sauvegardé (closes #1175)
- 5e5ba2c: fix(app): can't clear search field (closes #1171)
- 94d5197: fix(lydia): registering new accounts did not work
- ff2d33e: Change type of Mutation.checkIfBookingIsPaid to Result<Registration> instead of Boolean

## 2.11.0

### Minor Changes

- ba3c0cd: Feat: family tree

## 2.10.1

### Patch Changes

- 3cff84f: chore(deps): upgrade dependencies
- Updated dependencies [3cff84f]
  - arborist@0.1.1

## 2.10.0

### Minor Changes

- 1a22e09: make login/done prettier
- 452566a: rework posts UI
- a6d103c: add mixed search
- a99043a: specialcase birthday when it's today

## 2.9.0

### Minor Changes

- 6815750: allow filtering logs by action

### Patch Changes

- 6815750: fix(frappe): document links triggered client-side navigation when api and app are on the same domain (closes #1162)
  fix(frappe): data was sometimes loaded too late, resulting in a 404
  fix(frappe): no solutions available indicator was green
  fix(email changes): create request for target email's user, not logged in user
  fix(ticketing): duplication de billet lors de la création (closes #1150)
  fix(profile): add text to profile badges (closes #1091)
  fix(app): churro à la place de churros sur petit ecran (closes #1155)
  fix(profile): crash sometimes when getting to page (see #1157)
- 6815750: fix(registration): do not allow custom username

## 2.8.2

### Patch Changes

- 3f7d732: fix: diplay correct root actions when not connected
- 69f6446: fix: hide graduation year if not in major

## 2.8.1

### Patch Changes

- 26f4a09: fix(registration): do not allow custom username

## 2.8.0

### Minor Changes

- 4175768: allow filtering through logs via get params, see commit for more info and https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search

## 2.7.0

### Minor Changes

- 8fef930: implement ticket counting policies
- 86f8a45: add "add to apple wallet" support for bookings
- 975b061: add setting to change saved lydia phone
- 34a50bd: add UI to manage ticket groups

### Patch Changes

- 993f52d: fix(app): remove global top progress bar (closes #1123)
  fix(app): don't crash when trying mutation with invalid date
  fix(app): accept null for data on CardBooking
  fix(ticketing/scan): surface error when camera not found on event scanning view (closes #1127)
  fix(app): check for navigator.vibrate support everywhere (closes #1121)
  fix(app): polyfill URL.canParse and Array#toReversed
  fix(social links): don't use named capture groups (closes #1122)
  fix(app): modaldialog close click handler: use e.currenttarget instead of element (closes #1126)
  fix(app): buttonlike: cannot read properties of null (reading 'likes') (closes #1124)
- 7e8f072: make ticket payment modal more robust with regards to lydia payments
- 7c8aafe: link to event was lost on post save

## 2.6.0

### Minor Changes

- 96e9d1d: variable prices support

## 2.5.1 - [YANKED]

### Patch Changes

- dc84fbe: fix(ticketing): could set godsons even when godson limit was diabled
- 92167a6: fix(ticketing): variable price input was enabled on price change
- 12337d6: fix pwa instabillity issues (maybe)

## 2.5.0

### Minor Changes

- 8afacba: feat(app): sentry support

## 2.4.1

### Patch Changes

- 0f65a48: fix: could not self-join groups
- 992fa2d: fix other ticket link color
- 6558e15: fix calendar bug showing day of the week (1 - 7) instead of day of the month (1 - 31)

## 2.4.0

### Minor Changes

- 3b34c20: feat(ticketing): add external payment method
- bc65f15: feat(bookings): show booking links at the end of the payment journey

## 2.3.2

### Patch Changes

- f4d6f2e: send 404 on /uid.png when picture is not set
- daf01e1: improve wording on ticket beneficiaries (closes #1077)
- 5df3d35: image on picture edit forms was stretched
- 989388c: PillLink on event look like they have social=true (closes #1079)

## 2.3.1

### Patch Changes

- 0a2b8da: make welcome page load and fix buttons

## 2.3.0

### Minor Changes

- 7b4d1d6: fix pickmajor (by hardcoding exclusion of the inp majors group for now), display school of quicksignup first
- d64bbc9: remove forms, add signups to backrooms

## 2.2.0

### Minor Changes

- c540e85: add button to download group handover on group profile

### Patch Changes

- 5647f95: fix cannot logout when logged-in via oauth but authed_via was not set

## 2.1.0

### Minor Changes

- 86413c4: Planning view now goes up to a month
- 28b9678: disable publish later on articles for now

### Patch Changes

- 6970b6a: force reload static CSS
- 54ec422: fix generated buildinfo version
- 7888095: Fix some validation bugs around signups

## 2.0.0

### Major Changes

- a9689bd: Refresh UI

### Patch Changes

- 60e9ac7: chore(changesets): version db and fix sync / api / app packages dependencies
