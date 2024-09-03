# @churros/db

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
