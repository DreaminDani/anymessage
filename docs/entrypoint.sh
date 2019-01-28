#!/bin/sh

set -e

if [ -n "$NPM_AUTH_TOKEN" ]; then
  # Respect NPM_CONFIG_USERCONFIG if it is provided, default to $HOME/.npmrc
  NPM_CONFIG_USERCONFIG="${NPM_CONFIG_USERCONFIG-"$HOME/.npmrc"}"
  NPM_REGISTRY_URL="${NPM_REGISTRY_URL-registry.npmjs.org}"

  # Allow registry.npmjs.org to be overridden with an environment variable
  printf "//%s/:_authToken=%s\\nregistry=%s" "$NPM_REGISTRY_URL" "$NPM_AUTH_TOKEN" "$NPM_REGISTRY_URL" > "$NPM_CONFIG_USERCONFIG"
  chmod 0600 "$NPM_CONFIG_USERCONFIG"
fi

git config --global user.email "info@anymessage.io"
git config --global user.name "AnyMessage CI"

# install api package
cd api
npm install

# run pre-build steps
cd ../docs/_build
npm install
npm run build

# build jekyll into _site
cd ..
bundle install
bundle exec jekyll build

cp ./CNAME ./_build/CNAME

# get ready for deploy
cd _build
sh -c "npm $*"
