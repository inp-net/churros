#!/usr/bin/env sh

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail

echo 'Applying migrations...'
yarn run prisma migrate deploy || tail -f /dev/null
echo 'Migrated!'
