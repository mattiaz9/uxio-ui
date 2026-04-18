"use client"

import React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/uxio/overrides-alert-dialog-base/alert-dialog"
import { Spinner } from "@/registry/uxio/overrides-spinner/spinner"
import { IconPlaceholder } from "@/registry/uxio/shared/icon-placeholder/icon-placeholder"

import type { Dispatch, SetStateAction } from "react"

export interface ConfirmerOptions {
  variant?: React.ComponentProps<typeof AlertDialogAction>["variant"]
  title: string
  description?: string
  cancelButtonTitle?: string
  confirmButtonTitle?: string
  children?: React.ReactNode
  displayError?: "none" | "above-content" | "below-content"
  disableCancelWhilePending?: boolean
  renderError?: (error: Error) => React.ReactNode
  action?: (abortSignal: AbortSignal) => void | Promise<void>
}

interface ConfirmerState extends ConfirmerOptions {
  isLoading?: boolean
  error?: Error
}

let listener: Dispatch<SetStateAction<ConfirmerState | undefined>> | undefined

let resolveConfirmer: ((success: boolean) => void) | undefined

let actionAbortController: AbortController | undefined

function openConfirmer(options: ConfirmerOptions) {
  if (listener) {
    listener({
      cancelButtonTitle: "Cancel",
      confirmButtonTitle: "OK",
      displayError: "below-content",
      ...options,
    })
  }
}

function hideConfirmer(success: boolean) {
  resolveConfirmer?.(success)
  resolveConfirmer = undefined
  listener?.(undefined)
}

async function runAction(action: (abortSignal: AbortSignal) => void | Promise<void>) {
  const abortController = new AbortController()
  actionAbortController = abortController

  listener?.((state) => ({
    ...(state as ConfirmerState),
    isLoading: true,
    error: undefined,
  }))

  try {
    const promisifiedAction = new Promise<void>((resolve, reject) => {
      try {
        const promise = action(abortController.signal)
        if (promise) {
          promise.then(resolve).catch(reject)
          return
        }
        resolve()
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })

    const result = await promisifiedAction
      .then(() => true)
      .catch((error: unknown) => (error instanceof Error ? error : new Error(String(error))))

    if (abortController.signal.aborted) {
      return
    }

    if (result instanceof Error) {
      listener?.((state) => ({
        ...(state as ConfirmerState),
        isLoading: false,
        error: result,
      }))
    } else {
      hideConfirmer(true)
    }
  } finally {
    if (actionAbortController === abortController) {
      actionAbortController = undefined
    }
  }
}

async function confirm(options: ConfirmerOptions) {
  openConfirmer(options)

  return new Promise<boolean>((resolve) => {
    resolveConfirmer = resolve
  })
}

function DefaultRenderError({ error }: { error: Error }) {
  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/5 p-3 text-sm text-destructive">
      <IconPlaceholder
        lucide="TriangleAlertIcon"
        tabler="IconAlertTriangle"
        hugeicons="Alert02Icon"
        phosphor="WarningIcon"
        remixicon="RiErrorWarningLine"
        className="size-4 shrink-0"
      />
      <span>{error.message}</span>
    </div>
  )
}

function Confirmer() {
  const [open, setOpen] = React.useState(false)
  const [payload, setPayload] = React.useState<ConfirmerState>()

  React.useEffect(() => {
    listener = (action) => {
      if (typeof action === "function") {
        setPayload((prev) => {
          const next = action(prev)
          if (next === undefined) {
            setOpen(false)
            return undefined
          }
          return next
        })
      } else if (action === undefined) {
        setOpen(false)
      } else {
        setPayload(action)
        setOpen(true)
      }
    }
  }, [])

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
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
          <AlertDialogTitle>{payload?.title}</AlertDialogTitle>
          <AlertDialogDescription
            dangerouslySetInnerHTML={{ __html: payload?.description ?? "" }}
          />
        </AlertDialogHeader>
        <div className="flex flex-col gap-y-3">
          {payload?.error &&
            payload.displayError === "above-content" &&
            (payload.renderError?.(payload.error) ?? <DefaultRenderError error={payload.error} />)}
          {payload?.children}
          {payload?.error &&
            payload.displayError === "below-content" &&
            (payload.renderError?.(payload.error) ?? <DefaultRenderError error={payload.error} />)}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={Boolean(payload?.disableCancelWhilePending && payload?.isLoading)}
            onClick={() => {
              actionAbortController?.abort()
              hideConfirmer(false)
            }}
            data-action="cancel"
          >
            {payload?.cancelButtonTitle || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={payload?.variant ?? "default"}
            onClick={() => (payload?.action ? runAction(payload.action) : hideConfirmer(true))}
            data-action="confirm"
          >
            {payload?.isLoading && <Spinner data-icon="inline-start" />}
            {payload?.confirmButtonTitle || "OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Confirmer, confirm }
