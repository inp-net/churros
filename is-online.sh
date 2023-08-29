#!/bin/sh

lsof -i:3000 && lsof -i:4000 && lsof -i:4001
