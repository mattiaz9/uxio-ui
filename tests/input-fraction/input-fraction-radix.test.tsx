import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { InputFraction } from "@/registry/uxio/inputs-input-fraction-radix/input-fraction"

function getLastChangedValue(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.lastCall?.[0] as React.ChangeEvent<HTMLInputElement> | undefined
  return lastCall?.target.value
}

describe("InputFraction radix", () => {
  test("commits normalized fraction after numerator and denominator entry", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputFraction onChange={onChange} onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0]!)
    await user.keyboard("2")
    await user.click(boxes[1]!)
    await user.keyboard("5")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith("2/5")
    expect(getLastChangedValue(onChange)).toBe("2/5")
  })
})
