import * as React from "react"

let started = false

export function SiteTracker() {
  React.useEffect(() => {
    const siteId = import.meta.env.VITE_INGEXT_SITE_ID
    if (!siteId || started) return
    started = true
    const host = import.meta.env.VITE_INGEXT_HOST
    void import("ingext-tracker").then(({ init }) => {
      init({
        siteId,
        ...(host ? { host } : {}),
      })
    })
  }, [])

  return null
}
