# @churros/api

## 6.0.0

### Major Changes

- bba3e47: change return type and argument type for Mutation.deleteArticle
- f09cd52: Change arguments for Mutation.requestEmailChange: email is now newEmail and there's an additional user argument
- 02fa1a0: Event.placesLeft and Ticket.placesLeft are now of type Capacity and not Int. Instead of -1 to represent infinity, the Capacity scalar is used

### Minor Changes

- 6e11d67: Add Bookmark.url, useful for bookmarking services
- 02fa1a0: allow hiding capacity on tickets
- f09cd52: fix and improve email change request flow (wording in email, appearance of error state, and making request creating actually work)
- 02fa1a0: show event managers inherited from group memberships
- 02fa1a0: only Edit-level managers can now see places left count and capacities when they are hidden
- aee5a3a: make repository url to the churros repo env-configurable, defaults to https://git.inpt.fr/churros/churros

### Patch Changes

- 12d9dec: fix(profile): paiement en attente sur le profil d'ae quand loggedout (closes #1176)
- eecc2c9: fix Mutation.updateGroupMember createdAt not doing anything
- Updated dependencies [02fa1a0]
  - @churros/db@3.1.0

## 5.0.1

### Patch Changes

- 3e47614: allow postgresql: protocol alongside postgres: protocol for database_url env variable

## 5.0.0

### Major Changes

- 4f87c5e: improve groups' Lydia accounts management and fix bugs
- 3fa8469: feat(shop): drop shops (shops will come back as a separate project)

### Minor Changes

- 78a786a: validate env vars before launching server

### Patch Changes

- 524ef98: don't try to sync bot accounts to ldap when logging in or updating profile/curriculum of the bot account
- Updated dependencies [cfaed6e]
- Updated dependencies [3fa8469]
  - @churros/db@3.0.0

## 4.0.1

### Patch Changes

- cc5b1b6: fix dev deps

## 4.0.0

### Major Changes

- 2360071: remove bar weeks
- ff2d33e: Change type of Mutation.checkIfBookingIsPaid to Result<Registration> instead of Boolean

### Minor Changes

- 51dec97: allow specifying groups to apply promotions on by default, add mutation to generate simpps code, fix price display on ticket page
- 4f8eb7d: rework group members UI
- d95e254: feat(profile): enlarge picture on click
- ff2d33e: Allow creating a token after OAuth2 login process for use in contexts that don't support HttpOnly cookies (such as native apps)
- 620291b: add Mutation.upsertServiceV2, deprecate Mutation.upsertService
- fc2c196: search: allow bumping result ranks depending on their resource type in Query.search, see the PUBLIC_GLOBAL_SEARCH_BUMPS env var.
- ff2d33e: Allow pushing notifications through Firebase FCM -- set the NotificationSubscription endpoint to `apns://APNS TOKEN HERE` or `firebase://ANDROID FIREBASE TOKEN HERE`, and fill out the related env variables

### Patch Changes

- fd2d1b9: fix(members): purge user session cache when changing memberships
- Updated dependencies [51dec97]
- Updated dependencies [620291b]
- Updated dependencies [51dec97]
- Updated dependencies [2360071]
  - @churros/db@2.0.0

## 3.3.1

### Patch Changes

- 3cff84f: chore(deps): upgrade dependencies
- Updated dependencies [3cff84f]
  - arborist@0.1.1
  - @churros/db@1.3.1

## 3.3.0

### Minor Changes

- 452566a: rework posts UI
- a6d103c: add mixed search

## 3.2.0

### Minor Changes

- 6815750: allow filtering logs by action
- 6815750: add mutation deduplicateBookings

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
- 6815750: permission check for bookEvent now correctly handles beneficiaries

## 3.1.3

### Patch Changes

- d772236: chore: bump ldap7 to v1.0.12

## 3.1.2

### Patch Changes

- 238a90b: chore: bump ldap7 to v1.0.11

## 3.1.1

### Patch Changes

- 26f4a09: fix(registration): do not allow custom username

## 3.1.0

### Minor Changes

- 4175768: allow filtering through logs via get params, see commit for more info and https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search

### Patch Changes

- ddf3dc0: add debug logs to canBookEvent calculation

## 3.0.1

### Patch Changes

- b4bccf3: Fix crashes when trying to create apple wallet cards on events with pictures

## 3.0.0

### Major Changes

- 975b061: make saveLydiaPhone return a mutation result instead of the user directly

### Minor Changes

- 8fef930: implement ticket counting policies
- 86f8a45: add "add to apple wallet" support for bookings
- 687fb54: fix Ticket.registrations
- 34a50bd: add mutations to move a ticket to a group

### Patch Changes

- d645d37: anyone could edit a post
- a9bbdbb: fix(ticketing): global event capacity was not taken into account
- Updated dependencies [8fef930]
  - @churros/db@1.3.0

## 2.4.2

### Patch Changes

- 0a5528f: fix cannot book any event due to obscure prisma error
- bda5164: minimum price was sent to lydia even when paying more
- Updated dependencies [01d6cd0]
- Updated dependencies [2a2cb72]
  - @churros/db@1.2.2

## 2.4.1

### Patch Changes

- 96e9d1d: fix borked migration
- Updated dependencies [96e9d1d]
  - @churros/db@1.2.1

## 2.4.0 - [YANKED]

### Minor Changes

- c3229cc: feat(ticketing): add price to csv exports in bookings (closes #1081)

### Patch Changes

- Updated dependencies [188f34d]
  - @churros/db@1.2.0

## 2.3.0

### Minor Changes

- a4871ef: feat: add Group.membership

### Patch Changes

- cf6bee2: fix permissions for modifying and deleting links related to users
- 0f65a48: fix: could not self-join groups

## 2.2.0

### Minor Changes

- 682a3b8: feat(contributions): allow marking contributions as paid when we are admin of at least one of the AEs, not all of them
- 3b34c20: feat(ticketing): add external payment method

### Patch Changes

- d5f68be: fix app crash when handover page are generated for group without president or treasurer
- Updated dependencies [3b34c20]
  - @churros/db@1.1.0

## 2.1.2

### Patch Changes

- bf11f6b: fix(signups): upsert user in ldap
- 97ca481: prevent case-only uniques in uids
- Updated dependencies [bf11f6b]
  - @churros/db@1.0.1

## 2.1.1

### Patch Changes

- e9156d7: fix cannot book ticket on event that has a zero godson limit

## 2.1.0

### Minor Changes

- b735292: allow signing up via qrcode even when signups are disabled

## 2.0.2

### Patch Changes

- fcb9951: fix cannot self join or edit group details

## 2.0.1

### Patch Changes

- 54ec422: fix generated buildinfo version
- 7888095: Fix some validation bugs around signups

## 2.0.0

### Major Changes

- a9689bd: - Separate updateUser, upsertGroup into more specific mutations (with different permission levels)
  - Expose more `canXXX` fields on types, most with a `assert: String` argument to make the field raise an error if the permission is not granted
  - Add necessary queries and mutations for new features as mentionned in the database changes section above
  - More scalars to better document & validate incoming data: URL, LooseURL, Markdown, HTML, etc.
  - Centralize handling of pictures into a single mutation `setPicture`
  - Centralize handling of links into mutations `addLinks`, `updateLink` and `deleteLink`
  - New `profile` query to get any resource that can be identified by a uid

### Patch Changes

- 60e9ac7: chore(changesets): version db and fix sync / api / app packages dependencies
- 88b63d1: chore(deps): bump ldap7 to v1.0.9
- 582adfb: prevent crashing api when mailman API can't be contacted
- Updated dependencies [60e9ac7]
- Updated dependencies [b34b81a]
  - @churros/db@1.0.0
