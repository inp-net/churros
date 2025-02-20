---
'@churros/api': minor
---

Logging in successfully through a provider (OAuth for now) or locally (the "Local" provider) adds the provider to the list of allowed auth providers for that user. Once a user has a non-empty auth providers list, logging in locally if the Local provider is not present on the user is not possible.
