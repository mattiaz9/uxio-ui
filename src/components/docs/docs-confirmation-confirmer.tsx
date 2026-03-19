import { Confirmer as BaseConfirmer } from "@/examples/base/ui/confirmation"
import { Confirmer as RadixConfirmer } from "@/examples/radix/ui/confirmation"

/** Single Confirmer for layers confirmation docs (base examples + previews share one context). */
export function DocsConfirmerBase() {
  return <BaseConfirmer />
}

/** Single Confirmer for layers confirmation docs (radix examples + previews share one context). */
export function DocsConfirmerRadix() {
  return <RadixConfirmer />
}
