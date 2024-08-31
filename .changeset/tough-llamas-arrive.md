---
'@churros/api': major
---

- Separate updateUser, upsertGroup into more specific mutations (with different permission levels)
- Expose more `canXXX` fields on types, most with a `assert: String` argument to make the field raise an error if the permission is not granted
- Add necessary queries and mutations for new features as mentionned in the database changes section above
- More scalars to better document & validate incoming data: URL, LooseURL, Markdown, HTML, etc.
- Centralize handling of pictures into a single mutation `setPicture`
- Centralize handling of links into mutations `addLinks`, `updateLink` and `deleteLink`
- New `profile` query to get any resource that can be identified by a uid
