import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { InputDuration } from "@/registry/uxio/inputs-input-duration-radix/input-duration"

function getLastChangedValue(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.lastCall?.[0] as React.ChangeEvent<HTMLInputElement> | undefined
  return lastCall?.target.value
}

describe("InputDuration radix", () => {
  test("commits total seconds on blur", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onValueChange = vi.fn()

    render(<InputDuration format="HH:mm:ss" onChange={onChange} onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0])
    await user.keyboard("1")
    await user.tab()
    await user.click(boxes[1])
    await user.keyboard("2")
    await user.tab()
    await user.click(boxes[2])
    await user.keyboard("3")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith(3723, expect.anything())
    expect(getLastChangedValue(onChange)).toBe("3723")
  })
})
