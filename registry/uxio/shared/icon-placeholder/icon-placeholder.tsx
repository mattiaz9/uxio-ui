"use client"

import { lazy, Suspense, type ComponentProps } from "react"

import { SquareIcon } from "lucide-react"

import type { IconLibraryName } from "shadcn/icons"

const IconLucide = lazy(() =>
  import("@/registry/icons/icon-lucide").then((mod) => ({
    default: mod.IconLucide,
  })),
)

const IconTabler = lazy(() =>
  import("@/registry/icons/icon-tabler").then((mod) => ({
    default: mod.IconTabler,
  })),
)

const IconHugeicons = lazy(() =>
  import("@/registry/icons/icon-hugeicons").then((mod) => ({
    default: mod.IconHugeicons,
  })),
)

const IconPhosphor = lazy(() =>
  import("@/registry/icons/icon-phosphor").then((mod) => ({
    default: mod.IconPhosphor,
  })),
)

const IconRemixicon = lazy(() =>
  import("@/registry/icons/icon-remixicon").then((mod) => ({
    default: mod.IconRemixicon,
  })),
)

void import("@/registry/icons/icon-lucide")
void import("@/registry/icons/icon-tabler")
void import("@/registry/icons/icon-hugeicons")
void import("@/registry/icons/icon-phosphor")
void import("@/registry/icons/icon-remixicon")

export function IconPlaceholder({
  ...props
}: {
  [K in IconLibraryName]: string
} & ComponentProps<"svg">) {
  const iconLibrary = "lucide" as IconLibraryName
  const iconName = props[iconLibrary]

  if (!iconName) {
    return null
  }

  return (
    <Suspense fallback={<SquareIcon {...props} />}>
      {iconLibrary === "lucide" && <IconLucide name={iconName} {...props} />}
      {iconLibrary === "tabler" && <IconTabler name={iconName} {...props} />}
      {iconLibrary === "hugeicons" && <IconHugeicons name={iconName} {...props} />}
      {iconLibrary === "phosphor" && <IconPhosphor name={iconName} {...props} />}
      {iconLibrary === "remixicon" && <IconRemixicon name={iconName} {...props} />}
    </Suspense>
  )
}
