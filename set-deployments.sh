#!/bin/bash

case $# in
    0)
        lastTag=`git for-each-ref refs/tags --sort=-v:refname --format='%(refname:short)' --count=1`
        latest=${lastTag#v}
        prod=$latest
        staging=$latest
	;;
    1)
        prod=$1
        staging=$1
        ;;
    2)
        prod=$1
        staging=$2
        ;;
    *)
        echo "Usage: $0 <prod> <staging>"
        exit 1
        ;;
esac


echo Setting prod to $prod
echo Setting staging to $staging

realwd=$(pwd)

cd $(realpath k8s)

git pull --autostash

sed -i "s@harbor.k8s.inpt.fr/net7/centraverse:.*@harbor.k8s.inpt.fr/net7/centraverse:$prod@g" deployment-{api,app}.yaml 
sed -i "s@harbor.k8s.inpt.fr/net7/centraverse:.*@harbor.k8s.inpt.fr/net7/centraverse:$staging@g" deployment-{api,app}-staging.yaml 


git add deployment-{api,app}{,-staging}.yaml

git commit -m "churros: bump prod to $prod and staging to $staging"

git push 

kubectl apply -f .

cd $realwd

git push --tags
