"use client"

import { lazy, Suspense, type ComponentProps } from "react"

import { SquareIcon, type icons as lucideIcons } from "lucide-react"

import type { icons as tablerIcons } from "@tabler/icons-react"
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

type IconNames = {
  lucide: `${keyof typeof lucideIcons}Icon`
  tabler: keyof typeof tablerIcons
  hugeicons: string
  phosphor: string
  remixicon: string
}

export function IconPlaceholder({ ...props }: IconNames & ComponentProps<"svg">) {
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
