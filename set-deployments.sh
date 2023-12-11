#!/bin/bash

help() {
    echo "Usage: $0 (prod|staging) <version>"
    echo "       $0 (prod|staging)"
    echo "			   (uses the latest tag)"
    exit 1
}

if [ $# -eq 1 ] && [ $1 == "--help" ]; then help; fi
    

case $# in
    0)
	help;
	;;
    1)
	env=$1
        lastTag=`git for-each-ref refs/tags --sort=-v:refname --format='%(refname:short)' --count=1`
        latest=${lastTag#v}
	version=$latest
        ;;
    2)
	env=$1
	version=$2
        ;;
    *)
        help;
        ;;
esac

case $env in
	prod)
		paths=(deployment-{api,app}.yaml)
		;;
	staging)
		paths=(deployment-{api,app}-staging.yaml)
		;;
	*)
		help;
		;;
esac


echo "Setting $env to $version (latest is $latest)"

realwd=$(pwd)

cd $(realpath k8s)

git pull --autostash

sed -i "s@harbor.k8s.inpt.fr/net7/centraverse:.*@harbor.k8s.inpt.fr/net7/centraverse:$version@g" ${paths[@]}

git add ${paths[@]}

git commit -m "churros: bump $env to $version"

git push 

kubectl apply -f .

cd $realwd

git push --tags
