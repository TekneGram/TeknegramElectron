#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  export husky_skip_init=1
  sh -e "$0" "$@"
  exitCode="$?"

  if [ "$exitCode" != 0 ]; then
    echo "husky - hook failed (code $exitCode)"
  fi

  exit "$exitCode"
fi
