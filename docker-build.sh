set -xe

lastTag=`git for-each-ref refs/tags --sort=-refname --format='%(refname:short)' --count=1`
VERSION=${lastTag#v}

docker build -t harbor.k8s.inpt.fr/net7/centraverse:$VERSION .
docker push harbor.k8s.inpt.fr/net7/centraverse:$VERSION
