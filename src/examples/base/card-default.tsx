import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

export default function CardDefault() {
  return (
    <Card variant="default" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Default Card</CardTitle>
        <CardDescription>Standard card with the default variant styling.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use the default variant for regular content cards.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Action
        </Button>
      </CardFooter>
    </Card>
  )
}
