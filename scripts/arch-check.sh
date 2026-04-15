#!/usr/bin/env bash
set -euo pipefail

echo "Checking core/ and lib/ don't import from app/ or ui/..."
if grep -rn "from '@/ui/\|from '@/app/\|from \"@/ui/\|from \"@/app/" src/core/ src/lib/ 2>/dev/null; then
  echo "ERROR: Inner layers import from outer layers!"
  exit 1
fi

echo "Checking core/ has no framework imports..."
if grep -rn "from 'react\|from \"react\|from 'next\|from \"next" src/core/ 2>/dev/null; then
  echo "ERROR: core/ contains framework imports!"
  exit 1
fi

echo "All dependency rules pass."
