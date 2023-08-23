#!/bin/bash

yarn prisma generate
yarn prisma migrate deploy
yarn workspaces foreach -piv run start
