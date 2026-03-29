"use client"

import * as React from "react"

import { InputPassword } from "./ui/input-password"

export default function InputPasswordDefaultExample() {
  const [password, setPassword] = React.useState("")

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <InputPassword
        id="password-demo"
        name="password"
        value={password}
        placeholder="Enter password"
        onChange={(event) => setPassword(event.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Length: </span>
        {password.length}
      </p>
    </div>
  )
}
