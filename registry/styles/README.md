# Registry Styles

Style CSS files from [shadcn/ui](https://github.com/shadcn-ui/ui) that define `.cn-*` placeholder classes (e.g. `.cn-button`, `.cn-button-variant-default`).

These files are used during `registry:build` to transform component source: `createStyleMap` parses each CSS file, and `transformStyle` replaces `cn-*` placeholders in components with the actual Tailwind classes from the style.

**Style mapping:**
- `style-nova.css` → base-nova, radix-nova
- `style-vega.css` → base-vega, radix-vega
- `style-maia.css` → base-maia, radix-maia
- `style-lyra.css` → base-lyra, radix-lyra
- `style-mira.css` → base-mira, radix-mira

Source: https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/styles
