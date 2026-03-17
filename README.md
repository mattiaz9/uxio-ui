# uxio UI

An open-source UI library based on [shadcn/ui](https://ui.shadcn.com), distributed via the
[shadcn registry](https://ui.shadcn.com/docs/registry).

**Registry URL:** [ui.uxio.dev](https://ui.uxio.dev)

## Stack

- **Framework:** [TanStack Start](https://tanstack.com/start)
- **Documentation:** [Fumadocs](https://www.fumadocs.dev)
- **UI:** Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com)
- **Linting/Formatting:** [Oxlint](https://oxc.rs/docs/guide/usage/linter) +
  [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- **Deployment:** Nitro on Vercel (static prerendering)

## Component Categories

- **Overrides:** Enhancements of existing shadcn components
- **Layout:** Layout components
- **UI:** Custom uxio UI components

## Installation

Add components using the shadcn CLI. The correct variant (base or radix) is resolved automatically
from your `components.json` style. Radix is the default.

```bash
# Add @uxio to your components.json registries, then:
npx shadcn@latest add @uxio/button
```

Configure your registry in `components.json`:

```json
{
  "registries": {
    "@uxio": "https://ui.uxio.dev/r/styles/{style}/{name}.json"
  }
}
```

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm run build
```

This runs:

1. `registry:build` - Builds the shadcn registry JSON files
2. `vite build` - Builds the app with static prerendering
3. `tsc --noEmit` - Type checking

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm run registry:build` - Build registry JSON files only
- `pnpm run lint` - Run oxlint
- `pnpm run format` - Format with oxfmt
- `pnpm run format:check` - Check formatting

## Project Structure

```
├── content/docs/          # Fumadocs MDX content
├── public/r/              # Registry JSON (generated)
├── registry/              # Registry component source
│   └── uxio/
│       ├── overrides-button-base/ # Base UI button
│       └── overrides-button-radix/ # Radix button
├── src/
│   ├── components/
│   │   └── ui/           # shadcn components (used by app)
│   ├── lib/
│   ├── routes/
│   └── styles/
├── registry.json          # Registry manifest
└── source.config.ts       # Fumadocs MDX config
```

## Adding New Components

1. Create component in `registry/uxio/[category]-[name]/`
2. Add entry to `registry.json`
3. Run `pnpm run registry:build`
4. Add documentation in `content/docs/`
