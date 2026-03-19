import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "./ui/item"

export default function ItemDefault() {
  return (
    <ItemGroup className="w-full max-w-md">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Default size</ItemTitle>
          <ItemDescription>Uses the default group gap.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Small item</ItemTitle>
          <ItemDescription>
            With a <code className="text-foreground">sm</code> item in the group, the default variant
            tightens vertical gap via{" "}
            <code className="text-foreground">has-data-[size=sm]:gap-2.5</code>.
          </ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  )
}
