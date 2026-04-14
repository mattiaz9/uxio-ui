import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

export default function CardDestructive() {
  return (
    <Card variant="destructive" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Destructive Card</CardTitle>
        <CardDescription>Use for warnings, errors, or destructive actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The destructive variant adds a subtle ring and footer styling.
        </p>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="destructive" size="sm" className="w-full">
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
