import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { InputNumber } from "@/registry/uxio/inputs-input-number-base/input-number"

function getLastChangedValue(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.lastCall?.[0] as React.ChangeEvent<HTMLInputElement> | undefined
  return lastCall?.target.value
}

describe("InputNumber base", () => {
  test("typing updates visible text and only fires onChange before commit", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputNumber onChange={onChange} onValueChange={onValueChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "12")

    expect(input).toHaveValue("12")
    expect(getLastChangedValue(onChange)).toBe("12")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test("blur commits the visible string and numeric value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputNumber onChange={onChange} onValueChange={onValueChange} max={10} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "99")
    await user.tab()

    expect(input).toHaveValue("10")
    expect(getLastChangedValue(onChange)).toBe("10")
    expect(onValueChange).toHaveBeenLastCalledWith(10)
  })

  test("enter commits a trailing separator as a valid number", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputNumber onChange={onChange} onValueChange={onValueChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "1.")
    await user.keyboard("{Enter}")

    expect(input).toHaveValue("1")
    expect(getLastChangedValue(onChange)).toBe("1")
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  test("arrow keys commit and update both text and numeric value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputNumber defaultValue="1" onChange={onChange} onValueChange={onValueChange} />)

    const input = screen.getByRole("textbox")
    input.focus()
    await user.keyboard("{ArrowUp}")

    expect(input).toHaveValue("2")
    expect(getLastChangedValue(onChange)).toBe("2")
    expect(onValueChange).toHaveBeenLastCalledWith(2)
  })

  test("step buttons commit and update both text and numeric value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputNumber defaultValue="1" onChange={onChange} onValueChange={onValueChange} />)

    await user.click(screen.getByRole("button", { name: "Increase value" }))

    expect(screen.getByRole("textbox")).toHaveValue("2")
    expect(getLastChangedValue(onChange)).toBe("2")
    expect(onValueChange).toHaveBeenLastCalledWith(2)
  })

  test("rejects invalid characters and filters paste", async () => {
    const user = userEvent.setup()
    render(<InputNumber />)

    const input = screen.getByRole("textbox")
    await user.type(input, "1a2")
    expect(input).toHaveValue("12")

    await user.clear(input)
    await user.click(input)
    await user.paste("3b,5")
    expect(input).toHaveValue("3,5")
  })

  test("preserves the comma separator on commit", async () => {
    const user = userEvent.setup()
    render(<InputNumber />)

    const input = screen.getByRole("textbox")
    await user.type(input, "1,5")
    await user.tab()

    expect(input).toHaveValue("1,5")
  })

  test("keeps incomplete values visible and commits null", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputNumber onChange={onChange} onValueChange={onValueChange} />)

    const input = screen.getByRole("textbox")
    await user.type(input, "-")
    await user.tab()

    expect(input).toHaveValue("-")
    expect(getLastChangedValue(onChange)).toBe("-")
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  test("string-controlled mode waits for the parent echo before normalizing display", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <InputNumber value="99" onChange={onChange} onValueChange={onValueChange} max={10} />,
    )

    const input = screen.getByRole("textbox")
    input.focus()
    await user.tab()

    expect(getLastChangedValue(onChange)).toBe("10")
    expect(onValueChange).toHaveBeenLastCalledWith(10)
    expect(input).toHaveValue("99")

    rerender(<InputNumber value="10" onChange={onChange} onValueChange={onValueChange} max={10} />)
    expect(screen.getByRole("textbox")).toHaveValue("10")
  })

  test("uncontrolled string and number defaultValue initialize display", () => {
    const { unmount } = render(<InputNumber defaultValue="12,5" />)
    expect(screen.getByRole("textbox")).toHaveValue("12,5")

    unmount()
    render(<InputNumber defaultValue={7} />)
    expect(screen.getByRole("textbox")).toHaveValue("7")
  })

  test("wheel does not change the value", () => {
    render(<InputNumber defaultValue="4" />)

    const input = screen.getByRole("textbox")
    fireEvent.wheel(input)

    expect(input).toHaveValue("4")
  })

  test("disabled and readOnly make steps inert", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<InputNumber defaultValue="4" disabled />)

    await user.click(screen.getByRole("button", { name: "Increase value" }))
    expect(screen.getByRole("textbox")).toHaveValue("4")

    rerender(<InputNumber defaultValue="4" readOnly />)
    await user.click(screen.getByRole("button", { name: "Increase value" }))
    expect(screen.getByRole("textbox")).toHaveValue("4")
  })
})
