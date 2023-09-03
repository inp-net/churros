#!/bin/bash

echo Setting prod to $1
echo Setting staging to $2

realwd=$(pwd)

cd $(realpath k8s)

git pull --autostash

sed -i "s@harbor.k8s.inpt.fr/net7/centraverse:.*@harbor.k8s.inpt.fr/net7/centraverse:$1@g" deployment-{api,app}.yaml 
sed -i "s@harbor.k8s.inpt.fr/net7/centraverse:.*@harbor.k8s.inpt.fr/net7/centraverse:$2@g" deployment-{api,app}-staging.yaml 


git add deployment-{api,app}{,-staging}.yaml

git commit -m "churros: bump prod to $1 and staging to $2"

git push 

kubectl apply -f .

cd $realwd
