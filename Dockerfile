from node:19

WORKDIR /app

run npm --force install -g yarn

copy . .

run yarn install

ENTRYPOINT [ "entrypoint.sh" ]
