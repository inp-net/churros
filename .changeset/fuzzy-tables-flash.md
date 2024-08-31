---
'@churros/db': major
---

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
