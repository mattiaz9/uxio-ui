---
name: extend-component
description: Extend a shadcn/ui component.
user-invocable: true
---

# Instructions on how to extend a shadcn/ui component

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

- Update the registry config file `registry/uxio/registry.config.json` with the new component,
  making sure to add the same dependencies as the original component. If the component was
  previously found you can find the config references at
  https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/_registry.ts and
  https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/radix/ui/_registry.ts

- Add docs pages for each framework used in `content/docs/overrides/{base}/{name}.mdx`
  - Add a brief description and installation instructions. For reference look at
    `content/docs/overrides/{base}/button.mdx`
  - Add links in `content/docs/overrides/meta.json` for the new component.
  - Add a ToC for the extended features including a example for each feature. For now just use a
    default example with the default component features, unless instruction about the extended
    features are provided.
  - The examples should be placed in `src/examples/{base}/{name}-{feature}.tsx`.
