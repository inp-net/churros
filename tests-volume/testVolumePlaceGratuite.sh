#!/bin/bash

HOSTS=("host1" "host2")

UIDS=("uid1" "uid2")

for i in "${!HOSTS[@]}"; do
	sshpass -p "MDP_SSH" ssh -o StrictHostKeyChecking=accept-new LOGIN_SSH@${HOSTS[$i]} -t "cd Bureau/testChurros; python3 prendrePlaceGratuite.py ${UIDS[$i]} 12 ${HOSTS[$i]}" &
done
