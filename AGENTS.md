## Working on the registry code

Shared registry helpers (not shadcn registry items) live under `registry/uxio/shared/{name}/`.
Import them as `@/registry/uxio/shared/{name}/…`; `scripts/build-registry.ts` merges them into any
published item that references them.

Docs-only hooks under `src/app/(create)/lib/` (e.g. `search-params.ts`) are bundled the same way
when a registry file imports `@/app/(create)/lib/…`, and those imports are rewritten to
`@/components/ui/…` in published JSON.

When working on the registry code, whether it's adding a new component or updating an existing one
or adding utilities or styles NEVER include

- `components.json`
- `src/components/ui/`
- `src/styles/app.css` those are shadcn files used for the UI of this website NOT for the registry.
