ARG CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX=docker.io # override with git.inpt.fr/churros/dependency_proxy/containers, for example
ARG REPOSITORY_URL=https://git.inpt.fr/churros/churros



#####
# Common builder
#####


FROM $CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX/node:20.18.2-alpine AS builder

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
COPY packages/ /app/packages/ 

ARG APP_DOTENV_OVERRIDE=""
RUN if [ -n "$APP_DOTENV_OVERRIDE" ]; then \
      cp "$APP_DOTENV_OVERRIDE" /app/.env.example; \
      echo "Building app with a .env override:"; \
      cat /app/.env.example; \
    fi

COPY .git /app/.git
COPY scripts/ /app/scripts/

# Remove unused packages
RUN rm -rf packages/mock-n7-ldap pack
RUN rm -rf packages/oauth-client

RUN yarn install 
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

RUN yarn cap sync android

FROM builder AS builder-sync

WORKDIR /app
RUN yarn workspace @churros/db generate
RUN yarn workspace @churros/sync build



####
# Runtime common base
####



FROM $CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX/node:20.18.2-alpine AS base

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

RUN apk add --update --no-cache openssl

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
COPY --from=builder-app /app/packages/app/build-node/ /app/packages/app/build-node/
COPY --from=builder-app /app/packages/app/package.json /app/packages/app/

# Install dependencies
RUN yarn workspaces focus @churros/app --production

# Copy entrypoint
COPY packages/app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]


### Android

#### Common base

FROM $CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX/saschpe/android-sdk:35-jdk21.0.5_11 AS android-assemble-base

ARG ANDROID_ASSEMBLE_USER_UID=1001
ARG BUILD_NUMBER=1
ARG TAG=dev

WORKDIR /app

# create ~/.gradle/gradle.properties
RUN mkdir -p $HOME/.gradle
RUN echo "BUILD_VERSION_CODE=$BUILD_NUMBER" >> $HOME/.gradle/gradle.properties
RUN echo "BUILD_VERSION_NAME=$TAG" >> $HOME/.gradle/gradle.properties

COPY --from=builder-app --chown=$ANDROID_ASSEMBLE_USER_UID /app/packages/app/ /app/packages/app/
COPY --from=builder-app --chown=$ANDROID_ASSEMBLE_USER_UID /app/node_modules/@capacitor/ /app/node_modules/@capacitor/
COPY --from=builder-app --chown=$ANDROID_ASSEMBLE_USER_UID /app/node_modules/@capacitor-community/ /app/node_modules/@capacitor-community/
COPY --from=builder-app --chown=$ANDROID_ASSEMBLE_USER_UID /app/node_modules/@capgo/ /app/node_modules/@capgo/
COPY --from=builder-app --chown=$ANDROID_ASSEMBLE_USER_UID /app/node_modules/@capawesome/ /app/node_modules/@capawesome/


#### Release (sign the APK)

FROM android-assemble-base AS android-assemble-release

ARG APK_KEY_ALIAS=ALIAS

WORKDIR /app

RUN --mount=type=secret,id=APK_KEYSTORE_BASE64,uid=$ANDROID_ASSEMBLE_USER_UID \
    base64 -d -i /run/secrets/APK_KEYSTORE_BASE64 > /app/churros.keystore
RUN echo "KEYSTORE_PATH=/app/churros.keystore" >> $HOME/.gradle/gradle.properties

RUN --mount=type=secret,id=APK_KEYSTORE_PASSWORD,uid=$ANDROID_ASSEMBLE_USER_UID \ 
    echo "KEYSTORE_PASSWORD=$(cat /run/secrets/APK_KEYSTORE_PASSWORD || true)" >> $HOME/.gradle/gradle.properties

RUN echo "KEY_ALIAS=$APK_KEY_ALIAS" >> $HOME/.gradle/gradle.properties

RUN cat $HOME/.gradle/gradle.properties

WORKDIR /app/packages/app/android
RUN ./gradlew assembleRelease

FROM scratch AS android-release

# copy built apk from android-assemble
COPY --from=android-assemble-release /app/packages/app/android/app/build/outputs/apk/release/ .

#### Debug assemble (unsigned APK)

FROM android-assemble-base AS android-assemble-debug

RUN echo "KEYSTORE_PATH=null" >> $HOME/.gradle/gradle.properties
RUN echo "KEYSTORE_PASSWORD=null" >> $HOME/.gradle/gradle.properties
RUN echo "KEY_ALIAS=null" >> $HOME/.gradle/gradle.properties

WORKDIR /app/packages/app/android

RUN ./gradlew assembleDebug

FROM scratch AS android-debug

# copy built apk from android-assemble
COPY --from=android-assemble-debug /app/packages/app/android/app/build/outputs/apk/debug/ .

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


FROM $CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX/node:20.18.2-alpine AS prisma

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

### GraphQL schema

FROM scratch as graphql-schema

COPY --from=builder-api /app/packages/api/build/schema.graphql /schema.graphql

### Update bundle for OTA updates of the native apps

FROM builder-app as app-bundle-assemble

WORKDIR /app/packages/app

ARG TAG=dev
ARG APP_PACKAGE_ID=app.churros

RUN yarn dlx @capgo/cli bundle zip \
    --path build-static \
    --bundle $TAG \
    --name update-bundle.zip \
    $APP_PACKAGE_ID 

FROM scratch as app-bundle

COPY --from=app-bundle-assemble /app/packages/app/update-bundle.zip /update-bundle.zip
