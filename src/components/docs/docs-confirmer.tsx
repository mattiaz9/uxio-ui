import { Confirmer as BaseConfirmer } from "@/examples/base/ui/confirmer"
import { Confirmer as RadixConfirmer } from "@/examples/radix/ui/confirmer"

/** Single Confirmer for layers confirmer docs (base examples + previews share one context). */
export function DocsConfirmerBase() {
  return <BaseConfirmer />
}

/** Single Confirmer for layers confirmer docs (radix examples + previews share one context). */
export function DocsConfirmerRadix() {
  return <RadixConfirmer />
}
