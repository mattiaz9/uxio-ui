import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"

export default function CardRender() {
  return (
    <Card render={<a href="#" />} className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Documentation</CardTitle>
        <CardDescription>Open the docs — this whole card is a link.</CardDescription>
      </CardHeader>
    </Card>
  )
}
