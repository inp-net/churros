# @churros/api

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
