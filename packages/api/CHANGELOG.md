# @churros/api

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
