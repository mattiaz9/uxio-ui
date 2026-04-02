---
name: upgrade-styles
description: Upgrade the styles of all shadcn/ui component.
user-invocable: true
---

# Instructions on how to upgrade the styles of all shadcn/ui component

Upstream tokens live in `registry/styles/style-<name>.css`; Uxio-specific `cn-*` rules (including custom components) go in `registry/styles/style-<name>-uxio.css`. After replacing the base file, run `pnpm exec tsx scripts/sync-style-uxio-from-upstream.ts` to regenerate the uxio diff, or merge new upstream keys manually.

## Luma

- Go to
  https://raw.githubusercontent.com/shadcn-ui/ui/refs/heads/main/apps/v4/registry/styles/style-luma.css
  and copy the content
- Paste it in `registry/styles/style-luma.css` (full replace)
- Re-run `pnpm exec tsx scripts/sync-style-uxio-from-upstream.ts` or reconcile `style-luma-uxio.css` by hand

## Lyra

- Go to
  https://raw.githubusercontent.com/shadcn-ui/ui/refs/heads/main/apps/v4/registry/styles/style-lyra.css
  and copy the content
- Paste it in `registry/styles/style-lyra.css` (full replace)

## Maia

- Go to
  https://raw.githubusercontent.com/shadcn-ui/ui/refs/heads/main/apps/v4/registry/styles/style-maia.css
  and copy the content
- Paste it in `registry/styles/style-maia.css` (full replace)

## Mira

- Go to
  https://raw.githubusercontent.com/shadcn-ui/ui/refs/heads/main/apps/v4/registry/styles/style-mira.css
  and copy the content
- Paste it in `registry/styles/style-mira.css` (full replace)

## Nova

- Go to
  https://raw.githubusercontent.com/shadcn-ui/ui/refs/heads/main/apps/v4/registry/styles/style-nova.css
  and copy the content
- Paste it in `registry/styles/style-nova.css` (full replace)

## Vega

- Go to
  https://raw.githubusercontent.com/shadcn-ui/ui/refs/heads/main/apps/v4/registry/styles/style-vega.css
  and copy the content
- Paste it in `registry/styles/style-vega.css` (full replace)
