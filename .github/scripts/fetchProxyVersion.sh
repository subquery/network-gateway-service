PACKAGE_VERSION=$(cat ./package.json \
  | grep proxy-version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')


echo "::set-output name=APP_VERSION::$PACKAGE_VERSION"
