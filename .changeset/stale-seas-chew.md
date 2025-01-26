---
'@churros/api': patch
---

User.deletionConsequence would try to count comments, but the table was removed
