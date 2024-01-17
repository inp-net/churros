#!/bin/bash

yarn prisma generate
yarn prisma migrate deploy
yarn workspaces foreach -Apiv run start
