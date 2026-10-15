---
name: update-component
description: Add or update a shadcn/ui component.
user-invocable: true
---

# Instructions on how to update a shadcn/ui component override in the registry

- Make sure the promp has the component name, otherwise ask the user for it.
- For each framwork used in the registry create the file
  `registry/uxio/overrides-{name}-{base}/{name}.tsx`
- Go to https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/radix/ui and
  https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui and find the component
  requested

- If exists:
  - Navigate to each compoennt page, copy the code for both frameworks and paste it in
    `registry/uxio/overrides-{name}-{base}/{name}.tsx` (Make sure to copy exactly as it is,
    including all the classes)
- If doesn't exist:
  - If the user provided the code in the promp copy it to the file
    `registry/uxio/overrides-{name}-{base}/{name}.tsx` otherwise ask the user for the code.

- Do we need to add or update styles?
  - if so, add the styles to the `registry/styles/style-{name}-uxio.css` file.
  - make sure to keep the same radius, spacings and general sizing of the original theme.
  - Prefer Tailwind variant utilities on the `cn-*` classes (`group-data-[…]/…:…`, other `group-*`
    variants) over raw CSS descendant selectors such as `.cn-parent[data-attr="…"] .cn-child { … }`.
    In the component, use a named group on the root and `data-*` (or equivalent) for variants; in
    the stylesheet, style children through those group variants—do not wire state or size through ad
    hoc nested selectors.