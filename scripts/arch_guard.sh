#!/usr/bin/env bash
set -euo pipefail

if [ -d "src/core" ]; then
  if grep -R "from ['\"]\.\./extensions\|from ['\"].*/extensions\|from ['\"]\.\./app\|from ['\"].*/app" src/core >/dev/null 2>&1; then
    echo "arch_guard: src/core must not import app or extensions" >&2
    exit 1
  fi
fi

if grep -R "DISCORD_BOT_TOKEN=.*\|TURNSTILE_SECRET_KEY=.*" . \
  --exclude-dir=.git \
  --exclude=arch_guard.sh >/dev/null 2>&1; then
  echo "arch_guard: possible committed runtime secret assignment detected" >&2
  exit 1
fi

echo "arch_guard: ok"
