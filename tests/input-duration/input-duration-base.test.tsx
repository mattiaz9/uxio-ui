import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import { InputDuration } from "@/registry/uxio/inputs-input-duration-base/input-duration"

function getLastChangedValue(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.lastCall?.[0] as React.ChangeEvent<HTMLInputElement> | undefined
  return lastCall?.target.value
}

describe("InputDuration base", () => {
  test("commits total seconds on blur after entry (HH:mm:ss)", async () => {
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

  test("normalizes 170 minutes into hours and minutes on blur", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<InputDuration format="HH:mm" onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[1])
    await user.keyboard("170")
    await user.tab()

    expect(onValueChange).toHaveBeenLastCalledWith(10200, expect.anything())
  })

  test("does not emit until blur or Enter", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<InputDuration format="HH:mm:ss" onValueChange={onValueChange} />)

    const boxes = screen.getAllByRole("textbox")
    await user.click(boxes[0])
    await user.keyboard("1")
    expect(onValueChange).not.toHaveBeenCalled()
    await user.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenCalled()
  })

  test("controlled value in seconds updates display", () => {
    const { rerender } = render(
      <InputDuration format="mm:ss" value={300} onValueChange={() => {}} />,
    )

    let boxes = screen.getAllByRole("textbox")
    expect(boxes[0]).toHaveTextContent("05")
    expect(boxes[1]).toHaveTextContent("00")

    rerender(<InputDuration format="mm:ss" value={570} onValueChange={() => {}} />)
    boxes = screen.getAllByRole("textbox")
    expect(boxes[0]).toHaveTextContent("09")
    expect(boxes[1]).toHaveTextContent("30")
  })
})
