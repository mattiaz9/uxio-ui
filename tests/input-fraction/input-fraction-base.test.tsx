import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { InputFraction } from "@/registry/uxio/inputs-input-fraction-base/input-fraction"

function getLastChangedValue(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.lastCall?.[0] as React.ChangeEvent<HTMLInputElement> | undefined
  return lastCall?.target.value
}

describe("InputFraction base", () => {
  test("sets empty segment to 0 on blur", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<InputFraction onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0])
    await user.click(boxes[1])
    expect(boxes[0]).toHaveTextContent("0")
    await user.keyboard("5")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith("0/5", expect.anything())
  })

  test("commits normalized fraction after numerator and denominator entry", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputFraction onChange={onChange} onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0])
    await user.keyboard("2")
    await user.click(boxes[1])
    await user.keyboard("5")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith("2/5", expect.anything())
    expect(getLastChangedValue(onChange)).toBe("2/5")
  })

  test("default allows more than six digits per segment", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<InputFraction onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0])
    await user.keyboard("1234567")
    await user.click(boxes[1])
    await user.keyboard("89")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith("1234567/89", expect.anything())
    expect(boxes[0]).toHaveTextContent("1234567")
    expect(boxes[1]).toHaveTextContent("89")
  })

  test("maxDigits limits parsed controlled segment strings", () => {
    render(
      <InputFraction
        maxDigits={3}
        value="12345678901234567890/1"
        onValueChange={() => {}}
      />,
    )

    const boxes = screen.getAllByRole("textbox")
    expect(boxes[0]).toHaveTextContent("123")
    expect(boxes[1]).toHaveTextContent("1")
  })

  test("controlled value updates display", () => {
    const { rerender } = render(<InputFraction value="2/5" onValueChange={() => {}} />)

    let boxes = screen.getAllByRole("textbox")
    expect(boxes[0]).toHaveTextContent("2")
    expect(boxes[1]).toHaveTextContent("5")

    rerender(<InputFraction value="3/4" onValueChange={() => {}} />)
    boxes = screen.getAllByRole("textbox")
    expect(boxes[0]).toHaveTextContent("3")
    expect(boxes[1]).toHaveTextContent("4")
  })

  test("does not commit onValueChange for invalid denominator", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<InputFraction onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0])
    await user.keyboard("1")
    await user.click(boxes[1])
    await user.keyboard("0")
    await user.tab()

    expect(onValueChange).not.toHaveBeenCalled()
  })

  test("commit clamps numerator and denominator to bounds", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <InputFraction
        minNumerator={0}
        maxNumerator={5}
        minDenominator={5}
        maxDenominator={5}
        onValueChange={onValueChange}
      />,
    )

    let boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0])
    await user.keyboard("9")
    await user.click(boxes[1])
    await user.keyboard("5")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith("5/5", expect.anything())
    boxes = screen.getAllByRole("textbox")
    expect(boxes[0]).toHaveTextContent("5")
    expect(boxes[1]).toHaveTextContent("5")
  })

  test("controlled value from parent is clamped for display", () => {
    render(
      <InputFraction
        value="9/5"
        minNumerator={0}
        maxNumerator={5}
        minDenominator={5}
        maxDenominator={5}
        onValueChange={() => {}}
      />,
    )

    const boxes = screen.getAllByRole("textbox")
    expect(boxes[0]).toHaveTextContent("5")
    expect(boxes[1]).toHaveTextContent("5")
  })
})
