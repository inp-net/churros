from node:19

WORKDIR /app
run npm --force install -g yarn

copy . .
run yarn install
run yarn build

run chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
