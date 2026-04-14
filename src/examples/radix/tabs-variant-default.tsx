"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

function Row({
  size,
  label,
}: {
  size: "sm" | "default" | "lg"
  label: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <Tabs defaultValue="a" size={size} className="w-full">
        <TabsList>
          <TabsTrigger value="a">Account</TabsTrigger>
          <TabsTrigger value="b">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Account settings</TabsContent>
        <TabsContent value="b">Password settings</TabsContent>
      </Tabs>
    </div>
  )
}

export default function TabsVariantDefault() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Row size="sm" label="sm" />
      <Row size="default" label="default" />
      <Row size="lg" label="lg" />
    </div>
  )
}
