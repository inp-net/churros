filename=.changeset/$1.md

echo -- --- > $filename
for pkgfile in $(git diff --name-only | grep package.json)
    pkgname="@churros/$(basename $(dirname $pkgfile))"
    echo "\"$pkgname\": patch" >> $filename
end
echo -- --- >> $filename
echo >> $filename
git log -1 --pretty=%s >> $filename
