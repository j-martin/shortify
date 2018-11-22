#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -u

_main() {
  pushd ext
  zip -r ../clubify.zip .
  popd
}

_main "$@"
