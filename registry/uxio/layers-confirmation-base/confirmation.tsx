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

export interface Confirmation {
  variant?: React.ComponentProps<typeof AlertDialogAction>["variant"]
  title: string
  description?: string
  cancelButtonTitle?: string
  confirmButtonTitle?: string
  children?: React.ReactNode
  displayError?: "none" | "above-content" | "below-content"
  renderError?: (error: Error) => React.ReactNode
  action?: () => void | Promise<void>
}

interface ConfirmationState extends Confirmation {
  isLoading?: boolean
  error?: Error
}

let listener: Dispatch<SetStateAction<ConfirmationState | undefined>> | undefined

let resolveConfirmation: ((success: boolean) => void) | undefined

function showConfirmation(confirmation: Confirmation) {
  if (listener) {
    listener({
      cancelButtonTitle: "Cancel",
      confirmButtonTitle: "OK",
      displayError: "below-content",
      ...confirmation,
    })
  }
}

async function hideConfirmation(success: boolean) {
  resolveConfirmation?.(success)
  resolveConfirmation = undefined
  listener?.(undefined)
}

async function runAction(action: () => void | Promise<void>) {
  listener?.((state) => ({ ...(state as ConfirmationState), isLoading: true }))

  const promisifiedAction = new Promise<void>((resolve, reject) => {
    try {
      const promise = action()
      if (promise) {
        promise.then(resolve).catch(reject)
        return
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })

  const result = await promisifiedAction.then(() => true).catch((error) => error)
  listener?.((state) => ({
    ...(state as ConfirmationState),
    isLoading: false,
    error: result instanceof Error ? result : new Error(String(result)),
  }))
}

async function confirm(confirmation: Confirmation) {
  showConfirmation(confirmation)

  return new Promise<boolean>((resolve) => {
    resolveConfirmation = resolve
  })
}

function DefaultRenderError({ error }: { error: Error }) {
  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/5 p-3 text-sm text-destructive">
      <IconPlaceholder
        lucide="AlertTriangleIcon"
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
  const [state, setState] = React.useState<ConfirmationState>()

  React.useEffect(() => {
    listener = setState
  }, [])

  return (
    <AlertDialog open={!!state}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state?.title}</AlertDialogTitle>
          <AlertDialogDescription dangerouslySetInnerHTML={{ __html: state?.description ?? "" }} />
        </AlertDialogHeader>
        <div className="flex flex-col gap-y-3">
          {state?.error &&
            state.displayError === "above-content" &&
            (state.renderError?.(state.error) ?? <DefaultRenderError error={state.error} />)}
          {state?.children}
          {state?.error &&
            state.displayError === "below-content" &&
            (state.renderError?.(state.error) ?? <DefaultRenderError error={state.error} />)}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => hideConfirmation(false)} data-action="cancel">
            {state?.cancelButtonTitle || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={state?.variant ?? "default"}
            onClick={() => (state?.action ? runAction(state?.action) : hideConfirmation(true))}
            data-action="confirm"
          >
            {state?.isLoading && <Spinner data-icon="inline-start" />}
            {state?.confirmButtonTitle || "OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Confirmer, confirm }
