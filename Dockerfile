ARG CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX=docker.io # override with git.inpt.fr/churros/dependency_proxy/containers, for example
ARG REPOSITORY_URL=https://git.inpt.fr/churros/churros



#####
# Common builder
#####


FROM $CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX/node:20.19.0-alpine AS builder

ARG TAG=dev

WORKDIR /app

RUN apk add --no-cache git patch

# Yarn
COPY .yarn/ /app/.yarn/
COPY .yarnrc.yml /app/
COPY yarn.lock /app/

# packages
COPY package.json /app/

COPY CHANGELOG.md /app/CHANGELOG.md
COPY .env.example /app/.env.example
COPY .merge-drivers.yml /app/.merge-drivers.yml
COPY .git /app/.git
COPY packages/ /app/packages/ 
COPY scripts/ /app/scripts/

# Remove unused packages
RUN rm -rf packages/mock-n7-ldap pack
RUN rm -rf packages/oauth-client

RUN if ! yarn install; then cat /tmp/xfs-*/build.log; exit 1; fi
RUN yarn cp-env
RUN yarn generate-buildinfo

# Build arborist
RUN yarn workspace arborist build


#####
# Package-specific builders
#####


FROM builder AS builder-api

WORKDIR /app
RUN apk add --update --no-cache openssl
RUN yarn workspace @churros/api build

FROM builder AS builder-app

WORKDIR /app
COPY packages/app/schema.graphql /app/packages/api/build/schema.graphql
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN || true) \
    yarn workspace @churros/app build

FROM builder AS builder-sync

WORKDIR /app
RUN yarn workspace @churros/db generate
RUN yarn workspace @churros/sync build



####
# Runtime common base
####



FROM $CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX/node:20.19.0-alpine AS base

WORKDIR /app

COPY yarn.lock /app/
COPY .yarnrc.yml /app/
COPY .yarn/ /app/.yarn/
COPY package.json /app/

# Builded arborist
COPY --from=builder /app/packages/arborist/ /app/packages/arborist/



####
# Final images
####


#### API


FROM base AS api

LABEL org.opencontainers.image.source=$REPOSITORY_URL/packages/api

WORKDIR /app

ENV NODE_ENV="production"

RUN apk add --update --no-cache openssl git

# Prisma
COPY --from=builder-api /app/packages/db/prisma/ /app/packages/db/prisma/
COPY --from=builder-api /app/packages/db/src/ /app/packages/db/src/
COPY --from=builder-api /app/packages/db/package.json /app/packages/db/

# Builded api
COPY --from=builder-api /app/packages/api/build/src/ /app/packages/api/build/src/
COPY --from=builder-api /app/packages/api/build/schema.graphql /app/packages/api/build/schema.graphql
COPY --from=builder-api /app/packages/api/static/ /app/packages/api/static/
COPY --from=builder-api /app/packages/api/package.json /app/packages/api/

# Install dependencies
RUN yarn workspaces focus @churros/api --production

# Copy prisma client script
COPY packages/api/prisma-client.sh /app/prisma-client.sh

# Copy entrypoint
COPY packages/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]


### App


FROM base AS app

LABEL org.opencontainers.image.source=$REPOSITORY_URL/packages/app

WORKDIR /app

# Builded app
ENV NODE_ENV="production"
COPY --from=builder-app /app/packages/app/build/ /app/packages/app/build/
COPY --from=builder-app /app/packages/app/package.json /app/packages/app/

# Install dependencies
RUN yarn workspaces focus @churros/app --production

# Copy entrypoint
COPY packages/app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]


### Sync


FROM base AS sync

LABEL org.opencontainers.image.source=$REPOSITORY_URL/packages/sync

RUN apk add --update --no-cache openssl

ENV NODE_ENV="production"
COPY --from=builder-sync /app/packages/db/src/ /app/packages/db/src/
COPY --from=builder-sync /app/packages/db/package.json /app/packages/db/

COPY --from=builder-sync /app/packages/sync/build/src/ /app/packages/sync/build/src/
COPY --from=builder-sync /app/packages/sync/package.json /app/packages/sync/

RUN yarn workspaces focus @churros/sync --production

WORKDIR /app

ENTRYPOINT ["node", "packages/sync/build/src/index.js"]


### Database


FROM $CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX/node:20.19.0-alpine AS prisma

LABEL org.opencontainers.image.source=$REPOSITORY_URL/packages/db

RUN apk add --update --no-cache openssl

WORKDIR /app
COPY packages/db/prisma/ /app/packages/db/prisma/
COPY packages/db/prisma /app/prisma
COPY packages/db/package.json /app/package.json
COPY packages/db/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

RUN npm install -g corepack
RUN yarn install

ENTRYPOINT ["./entrypoint.sh"]


#####
# Artifacts
#####

FROM scratch as graphql-schema

COPY --from=builder-api /app/packages/api/build/schema.graphql /schema.graphql
