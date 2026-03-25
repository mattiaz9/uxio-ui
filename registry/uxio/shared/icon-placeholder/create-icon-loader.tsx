"use client"

import { use, type ComponentProps, type ComponentType } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

const iconPromiseCaches = new Map<string, Map<string, Promise<unknown>>>()

function getCache(libraryName: string): Map<string, Promise<unknown>> {
  let cache = iconPromiseCaches.get(libraryName)
  if (!cache) {
    cache = new Map()
    iconPromiseCaches.set(libraryName, cache)
  }
  return cache
}

function isIconData(data: unknown): data is IconSvgElement {
  return Array.isArray(data)
}

export function createIconLoader(libraryName: string) {
  const cache = getCache(libraryName)

  return function IconLoader({
    name,
    strokeWidth = 2,
    ...props
  }: {
    name: string
  } & ComponentProps<"svg">) {
    let iconPromise = cache.get(name)
    if (!iconPromise) {
      iconPromise = import(`./__${libraryName}__.ts`).then((mod: Record<string, unknown>) => {
        const icon = mod[name]
        return icon || null
      })
      cache.set(name, iconPromise)
    }

    const iconData = use(iconPromise)

    if (!iconData) {
      return null
    }

    if (isIconData(iconData)) {
      const hugeStroke = typeof strokeWidth === "number" ? strokeWidth : Number(strokeWidth) || 2
      return <HugeiconsIcon icon={iconData} strokeWidth={hugeStroke} {...props} />
    }

    const IconComponent = iconData as ComponentType<ComponentProps<"svg">>
    return <IconComponent {...props} />
  }
}
