import { Logo } from "@/components/assets/logo"

import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo className="h-3.5" />,
    },
    links: [],
  }
}
