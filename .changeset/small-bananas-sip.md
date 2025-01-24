---
'@churros/api': major
---

drop type Comment, interface Commentable, fields .comments, .comment and .commentId where they exist, Mutation.{upsert,delete}Comment and remove commentId argument from fields that take it
