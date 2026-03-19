import { InfoIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export default function AlertInfo() {
  return (
    <Alert variant="info">
      <InfoIcon />
      <AlertTitle>Info</AlertTitle>
      <AlertDescription>You can add components to your app using the registry.</AlertDescription>
    </Alert>
  )
}
