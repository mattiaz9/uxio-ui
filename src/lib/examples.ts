import { lazy, type ComponentType } from "react"

export type ExampleEntry = {
  component: React.LazyExoticComponent<ComponentType>
  source: string
}

const modules = import.meta.glob<{ default: ComponentType }>(
  ["../examples/**/*.tsx", "!../examples/**/ui/**"],
)

const sources: Record<string, string> = import.meta.glob(
  ["../examples/**/*.tsx", "!../examples/**/ui/**"],
  { query: "?raw", import: "default", eager: true },
)

export const examples: Record<string, ExampleEntry> = {}

for (const path in modules) {
  const name = path.replace(/^\.\.\/examples\//, "").replace(/\.tsx$/, "")
  examples[name] = {
    component: lazy(modules[path]),
    source: sources[path] ?? "",
  }
}
