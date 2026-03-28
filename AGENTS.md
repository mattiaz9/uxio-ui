## Working on the registry code

Shared registry helpers (not shadcn registry items) live under `registry/uxio/shared/{name}/` or
`registry/lib/`. Import shared folders as `@/registry/uxio/shared/{name}/…`, and import lib helpers
as `@/registry/lib/…`. `scripts/build-registry.ts` merges matching imports into published items:
UI files use `type: registry:ui` → `components/ui/…`; lib helpers use `type: registry:lib` → `lib/…`
(so the shadcn CLI installs them next to `components/ui`, not inside it). Imports are rewritten from
`@/registry/lib/…` to `@/lib/…` for consumers. Optional `files` in
`registry/uxio/registry.config.json` (shadcn `files` entries with `path` and `type: registry:lib`,
no `content`) forces extra `registry/lib` files into an item’s bundle when they are not already
pulled in via imports.

Docs-only hooks under `src/app/(create)/lib/` (e.g. `search-params.ts`) are bundled the same way
when a registry file imports `@/app/(create)/lib/…`, and those imports are rewritten to
`@/components/ui/…` in published JSON.

When working on the registry code, whether it's adding a new component or updating an existing one
or adding utilities or styles NEVER include

- `components.json`
- `src/components/ui/`
- `src/styles/app.css` those are shadcn files used for the UI of this website NOT for the registry.
