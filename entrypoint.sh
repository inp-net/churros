#!/bin/bash

yarn prisma generate
yarn prisma migrate deploy
yarn start
