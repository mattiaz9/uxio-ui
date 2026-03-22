"use client"

import React from "react"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/uxio/overrides-button-base/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/registry/uxio/overrides-command-base/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/uxio/overrides-popover-base/popover"

interface ComboboxContextState {
  open: boolean
  value: string
  items: Map<string, React.ReactNode>
  setOpen: (open: boolean) => void
  setValue: (value: string) => void
  onItemAdded: (value: string, label: React.ReactNode) => void
}

const ComboboxContext = React.createContext<ComboboxContextState | null>(null)

function useComboboxContext() {
  const context = React.useContext(ComboboxContext)
  if (context == null) {
    throw new Error("useComboboxContext must be used within a Combobox")
  }
  return context
}

function Combobox({
  children,
  value,
  defaultValue,
  onValueChange,
}: {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value ?? defaultValue ?? "")
  const currentValue = value ?? internalValue
  const [items, setItems] = React.useState<Map<string, React.ReactNode>>(new Map())

  function setValue(newValue: string) {
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  const onItemAdded = React.useCallback((value: string, label: React.ReactNode) => {
    setItems((prev) => {
      if (prev.get(value) === label) return prev
      return new Map(prev).set(value, label)
    })
  }, [])

  return (
    <ComboboxContext
      value={{
        open,
        setOpen,
        value: currentValue,
        setValue,
        items,
        onItemAdded,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        {children}
      </Popover>
    </ComboboxContext>
  )
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: {
  className?: string
  children?: React.ReactNode
} & React.ComponentProps<typeof Button>) {
  const { open } = useComboboxContext()

  return (
    <PopoverTrigger
      render={
        <Button
          {...props}
          variant={props.variant ?? "outline"}
          role={props.role ?? "combobox"}
          aria-expanded={props["aria-expanded"] ?? open}
          className={cn(
            "flex h-auto min-h-9 w-fit items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-transparent px-3 py-1.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
            className,
          )}
        />
      }
    >
      {children}
      <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
    </PopoverTrigger>
  )
}

function ComboboxValue({
  placeholder,
  className,
  ...props
}: React.ComponentProps<"span"> & { placeholder?: string }) {
  const { value, items } = useComboboxContext()

  if (!value && placeholder) {
    return (
      <span
        {...props}
        className={cn("min-w-0 overflow-hidden font-normal text-muted-foreground", className)}
      >
        {placeholder}
      </span>
    )
  }

  return (
    <span {...props} className={cn("min-w-0 truncate overflow-hidden", className)}>
      {items.get(value) ?? value}
    </span>
  )
}

function ComboboxContent({
  className,
  search = true,
  children,
  ...props
}: React.ComponentProps<typeof Command> & {
  search?: boolean | { placeholder?: string; emptyMessage?: string }
}) {
  const canSearch = typeof search === "object" ? true : search

  return (
    <>
      <div style={{ display: "none" }}>
        <Command>
          <CommandList>{children}</CommandList>
        </Command>
      </div>
      <PopoverContent className="w-auto min-w-(--anchor-width) p-0">
        <Command {...props} className={cn("w-auto", className)}>
          {canSearch ? (
            <CommandInput
              className="w-0 grow"
              placeholder={typeof search === "object" ? search.placeholder : undefined}
            />
          ) : (
            <button autoFocus className="sr-only" />
          )}
          <CommandList className="mt-4">
            {canSearch && (
              <CommandEmpty>
                {typeof search === "object" ? search.emptyMessage : undefined}
              </CommandEmpty>
            )}
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </>
  )
}

function ComboboxItem({
  value,
  children,
  onSelect,
  ...props
}: React.ComponentProps<typeof CommandItem>) {
  const { setValue, value: selectedValue, onItemAdded } = useComboboxContext()
  const isSelected = selectedValue === value

  React.useEffect(() => {
    function findComboboxText(node: React.ReactNode): React.ReactNode | undefined {
      if (node == null) return undefined
      if (React.isValidElement(node) && node.type === ComboboxText) return node
      if (React.isValidElement(node)) {
        const childNodes = (node.props as { children?: React.ReactNode }).children
        if (childNodes != null) {
          for (const child of React.Children.toArray(childNodes)) {
            const found = findComboboxText(child)
            if (found !== undefined) return found
          }
        }
      }
      return undefined
    }

    if (value !== undefined) {
      const placeholder =
        React.Children.toArray(children).reduce<React.ReactNode | undefined>(
          (acc, child) => acc ?? findComboboxText(child),
          undefined,
        ) ?? children
      onItemAdded(value, placeholder)
    }
  }, [value, children, onItemAdded])

  return (
    <CommandItem
      {...props}
      value={value}
      onSelect={(currentValue) => {
        const newValue = currentValue === selectedValue ? "" : currentValue
        setValue(newValue)
        onSelect?.(newValue)
      }}
    >
      <CheckIcon className={cn("mr-2 size-4", isSelected ? "opacity-100" : "opacity-0")} />
      {children}
    </CommandItem>
  )
}

function ComboboxText({ children, ...props }: React.ComponentProps<"span">) {
  return <span {...props}>{children}</span>
}

function ComboboxGroup(props: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup {...props} />
}

function ComboboxSeparator(props: React.ComponentProps<typeof CommandSeparator>) {
  return <CommandSeparator {...props} />
}

export {
  Combobox,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxContent,
  ComboboxItem,
  ComboboxText,
  ComboboxGroup,
  ComboboxSeparator,
}
