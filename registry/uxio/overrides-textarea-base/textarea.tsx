"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn("cn-textarea", className)} {...props} />
}

export { Textarea }
