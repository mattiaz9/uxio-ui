import { AlertTriangleIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export default function AlertWarning() {
  return (
    <Alert variant="warning">
      <AlertTriangleIcon />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your session will expire in 5 minutes. Please save your work.
      </AlertDescription>
    </Alert>
  )
}
