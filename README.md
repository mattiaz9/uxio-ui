# uxio/ui

An extended [shadcn/ui](https://ui.shadcn.com) library, distributed via the
[shadcn registry](https://ui.shadcn.com/docs/registry).

**Registry URL:** [ui.uxio.dev](https://ui.uxio.dev)

## Component Categories

- **Overrides:** Enhancements of existing shadcn components
- **Inputs:** Specialized input fields (currency, datetime, duration, number, password, and more)
- **Layers:** App-level UI layers (e.g. imperative confirmation)
- **UI:** Custom uxio/ui components

## Installation

Configure your registry in `components.json`:

```json
{
  "registries": {
    "@uxio": "https://ui.uxio.dev/r/styles/{style}/{name}.json"
  }
}
```

Add components using the shadcn CLI. Radix is the default.

```bash
# Add @uxio to your components.json registries, then:
npx shadcn@latest add @uxio/button
```

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
└── source.config.ts       # Fumadocs MDX config
```

## Acknowledgments

This project extends the [shadcn/ui](https://ui.shadcn.com) ecosystem. Parts of the implementation
draw on the [shadcn-ui/ui](https://github.com/shadcn-ui/ui) open-source repository — thanks to the
maintainers and contributors for the foundation and reference material.
