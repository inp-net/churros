# Pour refaire la migration initiale

1. `yarn prisma migrate dev --create-only --name init`
2. Copier-coller le contenu de `nanoid.sql` apres `CREATE EXTENSION IF NOT EXISTS "pgcrypto"` et avant toute instruction `CREATE TABLE` dans `xxxxxxxxx_init/migration.sql`
3. `yarn prisma migrate dev`
