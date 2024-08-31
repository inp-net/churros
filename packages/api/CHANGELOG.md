# @churros/api

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
