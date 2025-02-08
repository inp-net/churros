---
'@churros/api': minor
---

health checks are resolved on fields themselves, so that e.g. requesting healthcheck { database { prisma }} only executes a prisma healthcheck, instead of executing all checks and only returning data from the database.prisma part of the total health check
