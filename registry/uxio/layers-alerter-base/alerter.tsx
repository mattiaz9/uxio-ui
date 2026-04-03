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
} from "@/registry/uxio/overrides-alert-dialog-base/alert-dialog"
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
  const [state, setState] = React.useState<AlerterOptions>()

  React.useEffect(() => {
    listener = setState
  }, [])

  return (
    <AlertDialog
      open={!!state}
      onOpenChange={(open) => {
        if (!open) hideAlert()
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          {state?.variant && (
            <AlertDialogMedia
              className={cn({
                "bg-muted/50 text-muted-foreground": state.variant === "default",
                "bg-success/10 text-success": state.variant === "success",
                "bg-info/10 text-info": state.variant === "info",
                "bg-warning/10 text-warning": state.variant === "warning",
                "bg-destructive/10 text-destructive": state.variant === "destructive",
              })}
            >
              {state.variant === "default" && (
                <IconPlaceholder
                  lucide="CircleAlertIcon"
                  tabler="IconAlertCircle"
                  hugeicons="AlertCircleIcon"
                  phosphor="QuestionIcon"
                  remixicon="RiQuestionLine"
                />
              )}
              {state.variant === "success" && (
                <IconPlaceholder
                  lucide="CircleCheckIcon"
                  tabler="IconCircleCheck"
                  hugeicons="CheckmarkCircle02Icon"
                  phosphor="CheckCircleIcon"
                  remixicon="RiCheckboxCircleLine"
                />
              )}
              {state.variant === "info" && (
                <IconPlaceholder
                  lucide="InfoIcon"
                  tabler="IconInfoCircle"
                  hugeicons="InformationCircleIcon"
                  phosphor="InfoIcon"
                  remixicon="RiInformationLine"
                />
              )}
              {state.variant === "warning" && (
                <IconPlaceholder
                  lucide="TriangleAlertIcon"
                  tabler="IconAlertTriangle"
                  hugeicons="Alert02Icon"
                  phosphor="WarningIcon"
                  remixicon="RiErrorWarningLine"
                />
              )}
              {state.variant === "destructive" && (
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
          <AlertDialogTitle>{state?.title}</AlertDialogTitle>
          <AlertDialogDescription dangerouslySetInnerHTML={{ __html: state?.description ?? "" }} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="col-span-full" onClick={() => hideAlert()} data-action="ok">
            {state?.okButtonTitle || "OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Alerter, alert }
