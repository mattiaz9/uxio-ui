import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { InputCurrency } from "@/registry/uxio/inputs-input-currency-base/input-currency"

function getLastChangedValue(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.lastCall?.[0] as React.ChangeEvent<HTMLInputElement> | undefined
  return lastCall?.target.value
}

describe("InputCurrency base", () => {
  test("typing updates visible text and only fires onChange before commit", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(
      <InputCurrency
        currency="USD"
        locale="en-US"
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    )

    const input = screen.getByRole("textbox")
    await user.type(input, "12")

    expect(input).toHaveValue("12")
    expect(getLastChangedValue(onChange)).toBe("12")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  test("blur commits Intl numeric display and normalized string", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(
      <InputCurrency
        currency="USD"
        locale="en-US"
        onChange={onChange}
        onValueChange={onValueChange}
        max={10}
      />,
    )

    const input = screen.getByRole("textbox")
    await user.type(input, "99")
    await user.tab()

    expect(input).toHaveValue("10.00")
    expect(getLastChangedValue(onChange)).toBe("10.00")
    expect(onValueChange).toHaveBeenLastCalledWith("10")
  })

  test("enter commits and normalizes trailing separator", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(
      <InputCurrency
        currency="USD"
        locale="en-US"
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    )

    const input = screen.getByRole("textbox")
    await user.type(input, "1.")
    await user.keyboard("{Enter}")

    expect(input).toHaveValue("1.00")
    expect(onValueChange).toHaveBeenLastCalledWith("1")
  })

  test("onValueChange null for incomplete commit", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <InputCurrency
        currency="USD"
        locale="en-US"
        onChange={vi.fn()}
        onValueChange={onValueChange}
      />,
    )

    const input = screen.getByRole("textbox")
    await user.type(input, "-")
    await user.tab()

    expect(input).toHaveValue("-")
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  test("addon shows currency symbol for locale", () => {
    render(<InputCurrency currency="USD" locale="en-US" defaultValue={0} />)
    expect(screen.getByText("$", { exact: true })).toBeInTheDocument()
  })

  test("de-DE EUR places addon inline-end for symbol after amount", () => {
    const { container } = render(
      <InputCurrency currency="EUR" locale="de-DE" defaultValue={12.34} />,
    )
    const addon = container.querySelector("[data-slot=input-group-addon]")
    expect(addon).toHaveAttribute("data-align", "inline-end")
  })

  test("en-US: pasted amount keeps comma grouping and decimal dot", async () => {
    const user = userEvent.setup()
    render(<InputCurrency currency="USD" locale="en-US" />)

    const input = screen.getByRole("textbox")
    await user.click(input)
    await user.paste("1,234.56")

    expect(input).toHaveValue("1,234.56")
  })

  test("de-DE: pasted amount keeps dot grouping and decimal comma", async () => {
    const user = userEvent.setup()
    render(<InputCurrency currency="EUR" locale="de-DE" />)

    const input = screen.getByRole("textbox")
    await user.click(input)
    await user.paste("1.234,56")

    expect(input).toHaveValue("1.234,56")
  })

  test("arrow keys do not change value", async () => {
    const user = userEvent.setup()
    render(<InputCurrency currency="USD" locale="en-US" defaultValue="4" />)

    const input = screen.getByRole("textbox")
    input.focus()
    await user.keyboard("{ArrowUp}")

    expect(input).toHaveValue("4")
  })

  test("wheel does not change the value", () => {
    render(<InputCurrency currency="USD" locale="en-US" defaultValue="4" />)

    const input = screen.getByRole("textbox")
    fireEvent.wheel(input)

    expect(input).toHaveValue("4")
  })

  test("number controlled: can type decimal separator after focus on committed Intl display", async () => {
    const user = userEvent.setup()

    function Wrapper() {
      const [amount, setAmount] = React.useState(10)
      return (
        <InputCurrency
          currency="USD"
          locale="en-US"
          value={amount}
          onChange={vi.fn()}
          onValueChange={(v) => {
            if (v !== null) setAmount(Number(v))
          }}
        />
      )
    }

    render(<Wrapper />)

    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("10.00")

    await user.click(input)
    await user.type(input, ".")

    expect(input).toHaveValue("10.")
  })

  test("string controlled: onValueChange overwriting onChange still shows Intl decimals after commit", async () => {
    const user = userEvent.setup()

    function Wrapper() {
      const [text, setText] = React.useState("")
      return (
        <InputCurrency
          currency="USD"
          locale="en-US"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onValueChange={(v) => {
            if (v !== null) setText(v)
          }}
        />
      )
    }

    render(<Wrapper />)

    const input = screen.getByRole("textbox")
    await user.type(input, "12.5")
    await user.tab()

    expect(input).toHaveValue("12.50")
  })

  test("JPY emits integer normalized string", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <InputCurrency
        currency="JPY"
        locale="ja-JP"
        onChange={vi.fn()}
        onValueChange={onValueChange}
      />,
    )

    const input = screen.getByRole("textbox")
    await user.type(input, "1200")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith("1200")
  })
})
