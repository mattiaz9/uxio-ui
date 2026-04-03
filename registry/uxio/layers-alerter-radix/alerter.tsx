"use client"

import React from "react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/uxio/overrides-alert-dialog-radix/alert-dialog"
import { IconPlaceholder } from "@/registry/uxio/shared/icon-placeholder/icon-placeholder"

import type { Dispatch, SetStateAction } from "react"

export interface AlerterOptions {
  variant?: React.ComponentProps<typeof AlertDialogAction>["variant"]
  title: string
  description?: string
  okButtonTitle?: string
}

let listener: Dispatch<SetStateAction<AlerterOptions | undefined>> | undefined

function hideAlert() {
  listener?.(undefined)
}

function alert(options: AlerterOptions) {
  if (listener) {
    listener({
      okButtonTitle: "OK",
      ...options,
    })
  }
}

function Alerter() {
  const [open, setOpen] = React.useState(false)
  const [payload, setPayload] = React.useState<AlerterOptions>()

  React.useEffect(() => {
    listener = (next) => {
      if (next) {
        setPayload(next)
        setOpen(true)
      } else setOpen(false)
    }
  }, [])

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => !o && hideAlert()}
    >
      <AlertDialogContent
        size="sm"
        onAnimationEnd={(e) => {
          if (e.target !== e.currentTarget) return
          const t = e.currentTarget
          if (
            t.getAttribute("data-state") === "closed" ||
            (t.hasAttribute("data-closed") && !t.hasAttribute("data-open"))
          )
            setPayload(undefined)
        }}
      >
        <AlertDialogHeader>
          {payload?.variant && (
            <AlertDialogMedia
              className={cn({
                "bg-muted/50 text-muted-foreground": payload.variant === "default",
                "bg-success/10 text-success": payload.variant === "success",
                "bg-info/10 text-info": payload.variant === "info",
                "bg-warning/10 text-warning": payload.variant === "warning",
                "bg-destructive/10 text-destructive": payload.variant === "destructive",
              })}
            >
              {payload.variant === "default" && (
                <IconPlaceholder
                  lucide="CircleAlertIcon"
                  tabler="IconAlertCircle"
                  hugeicons="AlertCircleIcon"
                  phosphor="QuestionIcon"
                  remixicon="RiQuestionLine"
                />
              )}
              {payload.variant === "success" && (
                <IconPlaceholder
                  lucide="CircleCheckIcon"
                  tabler="IconCircleCheck"
                  hugeicons="CheckmarkCircle02Icon"
                  phosphor="CheckCircleIcon"
                  remixicon="RiCheckboxCircleLine"
                />
              )}
              {payload.variant === "info" && (
                <IconPlaceholder
                  lucide="InfoIcon"
                  tabler="IconInfoCircle"
                  hugeicons="InformationCircleIcon"
                  phosphor="InfoIcon"
                  remixicon="RiInformationLine"
                />
              )}
              {payload.variant === "warning" && (
                <IconPlaceholder
                  lucide="TriangleAlertIcon"
                  tabler="IconAlertTriangle"
                  hugeicons="Alert02Icon"
                  phosphor="WarningIcon"
                  remixicon="RiErrorWarningLine"
                />
              )}
              {payload.variant === "destructive" && (
                <IconPlaceholder
                  lucide="TriangleAlertIcon"
                  tabler="IconAlertTriangle"
                  hugeicons="Alert02Icon"
                  phosphor="WarningIcon"
                  remixicon="RiErrorWarningLine"
                />
              )}
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{payload?.title}</AlertDialogTitle>
          <AlertDialogDescription dangerouslySetInnerHTML={{ __html: payload?.description ?? "" }} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="col-span-full" onClick={() => hideAlert()} data-action="ok">
            {payload?.okButtonTitle || "OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Alerter, alert }
