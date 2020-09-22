#!/bin/bash

PACKAGE_NAME=${PWD##*/}
echo $PACKAGE_NAME

yarn publish || exit 1

YARN_TAG=$(echo $(git tag -l) | awk '{print $NF}')
NEXT_TAG=@armix/$PACKAGE_NAME@${YARN_TAG//v}

git tag -d $YARN_TAG
git tag $NEXT_TAG
