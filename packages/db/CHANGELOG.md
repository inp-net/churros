# @churros/db

## 4.3.4

### Patch Changes

- c8f2c86: fix(deps): update dependency @pothos/core to v4.4.1 (!663)

## 4.3.3

### Patch Changes

- 5a9f4ec: fix(deps): update dependency @pothos/core to v4.4.0 (!644)
- 382cad8: fix(deps): update prisma monorepo to ^6.4.1 (!646)

## 4.3.2

### Patch Changes

- 9e10869: fix(deps): update dependency @faker-js/faker to ^9.5.0 (!603)

## 4.3.1

### Patch Changes

- 6aecb8d: fix(deps): update dependency ioredis to ^5.5.0 (!573)

## 4.3.0

### Minor Changes

- 12b62f4: remove now-useless Comment value of NotificationChannel enum

## 4.2.0

### Minor Changes

- d5abb5c: deprecate Article.notifiedAt

### Patch Changes

- 8ea502c: fix(deps): update prisma monorepo to ^6.3.1 (!546)

## 4.1.6

### Patch Changes

- 9bc1b79: trackShare did not work for articles
- b7d0aaa: fix(deps): update prisma monorepo to v6 (major) (!464)

## 4.1.5

### Patch Changes

- 1c9d2f4: fix(deps): update dependency @faker-js/faker to ^9.4.0 (!497)
- 5569d5d: fix(deps): update dependency graphql to ^16.10.0 (!472)
- d445d96: fix(deps): update dependency ioredis to ^5.4.2 (!453)
- 9db4f8b: fix(deps): update dependency npm-run-all2 to ^7.0.2 (!501)
- 92e7bab: fix(deps): update dependency typescript to ^5.7.3 (!478)

## 4.1.4

### Patch Changes

- b779ec4: add back migration that was already applied in prod

## 4.1.3

### Patch Changes

- 778280f: remove superfluous migration

## 4.1.2

### Patch Changes

- cfbb198: reorder migration user_last_seen_at

## 4.1.1

### Patch Changes

- 535587d: fix migrations order: migration order of 4.1.0 was inconsistent with 4.0.1, which would cause a failed migration when applying

## 4.1.0 - [YANKED]

### Minor Changes

- 89f386f: allow users to delete their accounts
- 5880beb: allow hiding capacity on tickets
- a09feb9: add point of contacts on event (see #1229), allow specifying authorName when booking an event while loggedout (see #1209)
- 072d7f5: add event manager invite links system
- 2aebc49: allow search for bookings in /event/:id/bookings

## 4.0.1

### Patch Changes

- 43754a2: fix runtime error when running migrator because of missing openssl package

## 4.0.0

### Major Changes

- 50ffbd7: drop comments table

### Patch Changes

- 5b6b6ba: drop superfluous unique constraint of GodparentRequest's id, switch School.aliasMailDomains to text array

## 3.2.0

### Minor Changes

- 4589b01: allow tickets to be accessed via invitation links only
- 85bc631: theme dates are now nullable
- 93f7dd6: allow users to set their pronouns

### Patch Changes

- e1262b7: upgrade dependencies

## 3.1.0

### Minor Changes

- 02fa1a0: allow hiding capacity on tickets

## 3.0.0

### Major Changes

- 3fa8469: feat(shop): drop shops (shops will come back as a separate project)

### Minor Changes

- cfaed6e: feat(ticketing): improve default constraints (closes #1212)

## 2.0.0

### Major Changes

- 2360071: remove bar weeks

### Minor Changes

- 51dec97: allow specifying groups to apply promotions on by default, add mutation to generate simpps code, fix price display on ticket page
- 51dec97: Add Promotion.validByDefaultOn to specify groups to which to add applicable promotions by default

### Patch Changes

- 620291b: add `hidden` on `Service` to remove services from the user-facing list

## 1.3.1

### Patch Changes

- 3cff84f: chore(deps): upgrade dependencies

## 1.3.0

### Minor Changes

- 8fef930: implement ticket counting policies

## 1.2.2

### Patch Changes

- 01d6cd0: add phantom but required Registration.price
- 2a2cb72: Update fulltextsearch trigger for registration

## 1.2.1

### Patch Changes

- 96e9d1d: fix borked migration

## 1.2.0 - [YANKED]

### Minor Changes

- 188f34d: split price to min/max prices

## 1.1.0

### Minor Changes

- 3b34c20: feat(ticketing): add external payment method

## 1.0.1

### Patch Changes

- bf11f6b: fix(signups): upsert user in ldap

## 1.0.0

### Major Changes

- b34b81a: - Remove OAuth provider-related tables,
  - add GAT credentials,
  - Add themes,
  - Add bookmarked pages,
  - separate internal and external beneficiaries on bookings,
  - track share counts for posts and events, store only essential data on user candidates,
  - use separate token (and not id) for mail change requests,
  - make link URLs unique per resource,
  - add ability to mark majors as discontinued,
  - store board group of student associations,
  - store upsertion dates for groups,
  - store whether a group is unlisted,
  - add global capacity for events, store unlimited capacities as null and not -1,
  - track who saw a booking,
  - store callback url for lydia transaction when they get paid,
  - add Mandatory notification channel

### Minor Changes

- 60e9ac7: chore(changesets): version db and fix sync / api / app packages dependencies
