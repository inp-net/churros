---
'@churros/api': major
'@churros/app': major
'@churros/db': major
---

<!-- TODO: Separate by feature instead of package? -->

## Database changes

- Remove OAuth provider-related tables,
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

## API Changes

- Separate updateUser, upsertGroup into more specific mutations (with different permission levels)
- Expose more `canXXX` fields on types, most with a `assert: String` argument to make the field raise an error if the permission is not granted
- Add necessary queries and mutations for new features as mentionned in the database changes section above
- More scalars to better document & validate incoming data: URL, LooseURL, Markdown, HTML, etc.
- Centralize handling of pictures into a single mutation `setPicture`
- Centralize handling of links into mutations `addLinks`, `updateLink` and `deleteLink`
- New `profile` query to get any resource that can be identified by a uid

## App changes

- TODO mdrrrr 💀
