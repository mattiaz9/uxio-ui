import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { CheckCircleIcon } from "lucide-react"

export default function AlertSuccess() {
  return (
    <Alert variant="success">
      <CheckCircleIcon />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  )
}
