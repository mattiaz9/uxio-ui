import { CheckCircleIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export default function AlertSuccess() {
  return (
    <Alert variant="success">
      <CheckCircleIcon />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
  )
}
