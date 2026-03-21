import { Alerter as BaseAlerter } from "@/examples/base/ui/alerter"
import { Alerter as RadixAlerter } from "@/examples/radix/ui/alerter"

/** Single Alerter for layers alerter docs (base examples + previews share one context). */
export function DocsAlerterBase() {
  return <BaseAlerter />
}

/** Single Alerter for layers alerter docs (radix examples + previews share one context). */
export function DocsAlerterRadix() {
  return <RadixAlerter />
}
