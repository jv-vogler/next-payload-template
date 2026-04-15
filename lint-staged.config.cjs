const TEMPLATE_PATTERN_FILES = [
  'src/ui/blog/components/',
  'src/app/actions/blog.ts',
]

module.exports = {
  '**/*.{ts,tsx}': () => 'pnpm run typecheck',
  '**/*.{ts,tsx,js,jsx,md,json}': 'pnpm exec oxfmt --write',
  '**/*.{ts,tsx,js,jsx}': (files) => {
    const lintable = files.filter(
      (f) => !TEMPLATE_PATTERN_FILES.some((p) => f.includes(p)),
    )
    return lintable.length ? `pnpm exec oxlint ${lintable.join(' ')}` : 'echo "lint skipped"'
  },
}
