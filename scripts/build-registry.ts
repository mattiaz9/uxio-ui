#!/usr/bin/env node
/**
 * Build uxio registry with shadcn-style structure: styles/{style}/{name}.json
 *
 * Matches shadcn's approach:
 * 1. Reads style CSS (style-nova.css, style-vega.css, etc.) to create a style map
 * 2. Transforms component source: replaces cn-* placeholders with actual Tailwind
 * 3. Outputs registry JSON with transformed content per style
 *
 * The CLI replaces {style} in the registry URL with the project's components.json
 * style (e.g. base-nova, radix-nova), so users run `npx shadcn add @uxio/button`
 * and get the correct variant with styles baked in.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createStyleMap, transformStyle } from "shadcn/utils";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT = resolve(ROOT, "public/r");
const REGISTRY_STYLES = resolve(ROOT, "registry/styles");

// All shadcn style names (base + style or radix + style)
const STYLES = [
  "base-nova",
  "radix-nova",
  "base-vega",
  "radix-vega",
  "base-maia",
  "radix-maia",
  "base-lyra",
  "radix-lyra",
  "base-mira",
  "radix-mira",
] as const;

const BASE_DEPS = [
  "@base-ui/react/button",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
];

const RADIX_DEPS = [
  "@radix-ui/react-slot",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
];

function getBaseForStyle(style: string): "base" | "radix" {
  return style.startsWith("base-") ? "base" : "radix";
}

/** Map style name (e.g. base-nova) to style CSS file name (e.g. nova) */
function getStyleName(style: string): string {
  return style.replace(/^(base|radix)-/, "");
}

interface RegistryItem {
  $schema: string;
  name: string;
  type: "registry:ui";
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{
    path: string;
    content: string;
    type: "registry:ui";
  }>;
  categories: string[];
}

async function buildButtonItem(style: string): Promise<RegistryItem> {
  const base = getBaseForStyle(style);
  const styleName = getStyleName(style);
  const sourcePath =
    base === "base"
      ? resolve(ROOT, "registry/uxio/overrides-button-base/button.tsx")
      : resolve(ROOT, "registry/uxio/overrides-button-radix/button.tsx");

  const styleCssPath = resolve(REGISTRY_STYLES, `style-${styleName}.css`);
  if (!existsSync(styleCssPath)) {
    throw new Error(`Style CSS not found: ${styleCssPath}`);
  }

  const styleCss = readFileSync(styleCssPath, "utf-8");
  const styleMap = createStyleMap(styleCss);

  const source = readFileSync(sourcePath, "utf-8");
  const content = await transformStyle(source, { styleMap });

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "button",
    type: "registry:ui",
    title: "Button",
    description:
      base === "base"
        ? "Button component built on Base UI"
        : "Button component built on Radix UI Slot (with asChild support)",
    dependencies: base === "base" ? BASE_DEPS : RADIX_DEPS,
    registryDependencies: [],
    files: [
      {
        path: `registry/uxio/overrides-button-${base}/button.tsx`,
        content,
        type: "registry:ui",
      },
    ],
    categories: ["overrides"],
  };
}

async function main() {
  // Build styles/{style}/button.json for each style
  for (const style of STYLES) {
    const item = await buildButtonItem(style);
    const outDir = resolve(OUTPUT, "styles", style);
    const outFile = resolve(outDir, "button.json");

    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    writeFileSync(outFile, JSON.stringify(item, null, 2));
    console.log(`Built ${style}/button.json`);
  }

  // Also write a flat registry.json for the index (used by shadcn search)
  const registryIndex = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "uxio",
    homepage: "https://ui.uxio.dev",
    items: [
      {
        name: "button",
        type: "registry:ui",
        title: "Button",
        description:
          "Button component. Resolves to Base UI or Radix variant based on your components.json style.",
        categories: ["overrides"],
      },
    ],
  };

  writeFileSync(
    resolve(OUTPUT, "registry.json"),
    JSON.stringify(registryIndex, null, 2)
  );
  console.log("Built registry.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
