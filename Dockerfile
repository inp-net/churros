from node:19

WORKDIR /app

COPY . .
RUN yarn install
RUN yarn build
RUN rm -rf .git

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]
