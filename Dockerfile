from node:20-bullseye

WORKDIR /app

# jq and sponge are required for the barrel files generation
run apt-get update && apt-get install -y jq moreutils

copy package.json /app/
copy packages/api/package.json /app/packages/api/
copy packages/app/package.json /app/packages/app/
copy packages/arborist/package.json /app/packages/arborist/
copy packages/mock-n7-ldap/package.json /app/packages/mock-n7-ldap/
copy yarn.lock /app/
copy .yarnrc.yml /app/
copy .yarn/ /app/.yarn/
copy .husky/ /app/
run yarn install 

copy . .
run yarn build

run rm -rf .git

RUN chmod +x /app/entrypoint.sh
