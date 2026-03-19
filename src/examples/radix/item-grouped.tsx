import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "./ui/item"

export default function ItemGrouped() {
  return (
    <ItemGroup variant="grouped" className="w-full max-w-md">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>First</ItemTitle>
          <ItemDescription>Grouped variant merges inner borders and corner radius.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>Second (sm)</ItemTitle>
          <ItemDescription>
            Size-aware gap utilities are not applied on <code className="text-foreground">grouped</code>{" "}
            groups.
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Third</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  )
}
