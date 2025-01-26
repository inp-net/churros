---
'@churros/db': patch
---

fix migrations order: migration order of 4.1.0 was inconsistent with 4.0.1, which would cause a failed migration when applying
