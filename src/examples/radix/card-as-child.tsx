import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"

export default function CardAsChild() {
  return (
    <Card asChild className="w-full max-w-sm">
      <a href="#">
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>Open the docs — this whole card is a link.</CardDescription>
        </CardHeader>
      </a>
    </Card>
  )
}
