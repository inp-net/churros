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
	echo "Deploy on latest tag is managed by flux-system, nothing to do :)"
	echo "thx @simonh & @dreumonte <3"
	exit 0
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

sed -i "s@harbor.k8s.inpt.fr/net7/centraverse:[\w.]+@harbor.k8s.inpt.fr/net7/centraverse:$version@g" ${paths[@]}

git add ${paths[@]}

git commit -m "churros: set $env to $version"

git push 

kubectl apply -f .

cd $realwd
