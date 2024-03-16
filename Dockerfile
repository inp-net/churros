FROM node:20-alpine as builder

WORKDIR /app

RUN apk add --no-cache git

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

RUN yarn install
RUN yarn generate-buildinfo
RUN yarn workspaces foreach --exclude @centraverse/docs --interlaced --topological-dev -Apv run build


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

# Builded api
COPY --from=builder /app/packages/api/build/src/ /app/packages/api/build/src/
COPY --from=builder /app/packages/api/build/schema.graphql /app/packages/api/build/schema.graphql
COPY --from=builder /app/packages/api/prisma/ /app/packages/api/prisma/
COPY --from=builder /app/packages/api/package.json /app/packages/api/

# Install dependencies
RUN yarn workspaces focus @centraverse/api --production

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
RUN yarn workspaces focus @centraverse/app --production

# Copy entrypoint
COPY packages/app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
