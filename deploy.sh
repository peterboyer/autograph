#!/bin/bash

set -e

PACKAGE_NAME=${PWD##*/}
VERSION_PREV=$(jq '.version' package.json)
VERSION_NEXT=$1

echo "[$PACKAGE_NAME] $VERSION_PREV => \"$VERSION_NEXT\""

if [[ -z $VERSION_NEXT ]]; then
  echo "! missing [version] argument"
  exit 1
fi

echo "* building ..."
yarn build

echo "* authoring ..."
jq ".version=\"$VERSION_NEXT\"" package.json > lib/package.json

echo "* publishing ..."
cd lib
yarn publish --new-version $VERSION_NEXT --no-git-tag-version
cd ..

echo "* tagging ..."
mv -f lib/package.json package.json
git add package.json
git commit -m "v${VERSION_NEXT}"
git tag @armix/$PACKAGE_NAME@$VERSION_NEXT
