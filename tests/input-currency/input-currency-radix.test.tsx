import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { InputCurrency } from "@/registry/uxio/inputs-input-currency-radix/input-currency"

function getLastChangedValue(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.lastCall?.[0] as React.ChangeEvent<HTMLInputElement> | undefined
  return lastCall?.target.value
}

describe("InputCurrency radix", () => {
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
})
