FROM node:20-alpine as builder

WORKDIR /app

RUN apk add --no-cache git patch

COPY yarn.lock /app/
COPY .yarnrc.yml /app/
COPY .yarn/ /app/.yarn/
COPY package.json /app/
COPY CHANGELOG.md /app/CHANGELOG.md
COPY .env.example /app/.env.example
COPY .git /app/.git
COPY packages/ /app/packages/ 
COPY scripts/ /app/scripts/

# Remove unused packages
RUN rm -rf packages/mock-n7-ldap pack
RUN rm -rf packages/oauth-client

RUN yarn install
RUN yarn cp-env
RUN yarn generate-buildinfo

# truc temporaire bien guez pour comprendre pk il manque des vars d'env
RUN apk add bash
RUN bash -c printenv

RUN yarn workspaces foreach -Rt --from '{@churros/api,@churros/app}' run build


FROM node:20-alpine as base

WORKDIR /app

COPY yarn.lock /app/
COPY .yarnrc.yml /app/
COPY .yarn/ /app/.yarn/
COPY package.json /app/

# Builded arborist
COPY --from=builder /app/packages/arborist/ /app/packages/arborist/


FROM base as api

WORKDIR /app


# Prisma migration
COPY --from=builder /app/packages/db/prisma/ /app/packages/db/prisma/
COPY --from=builder /app/packages/db/src/ /app/packages/db/src/
COPY --from=builder /app/packages/db/package.json /app/packages/db/

# Builded api
COPY --from=builder /app/packages/api/build/src/ /app/packages/api/build/src/
COPY --from=builder /app/packages/api/build/schema.graphql /app/packages/api/build/schema.graphql
COPY --from=builder /app/packages/api/static/ /app/packages/api/static/
COPY --from=builder /app/packages/api/package.json /app/packages/api/

# Install dependencies
RUN yarn workspaces focus @churros/api --production

# Copy prisma client script
COPY packages/api/prisma-client.sh /app/prisma-client.sh

# Copy entrypoint
COPY packages/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]


FROM base as app

WORKDIR /app

# Builded app
COPY --from=builder /app/packages/app/build/ /app/packages/app/build/
COPY --from=builder /app/packages/app/package.json /app/packages/app/

# Install dependencies
RUN yarn workspaces focus @churros/app --production

# Copy entrypoint
COPY packages/app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
