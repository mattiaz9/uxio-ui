"use client"

import { useState } from "react"

import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

const SIDES = ["top", "right", "bottom", "left"] as const

export default function PopoverArrow() {
  const [side, setSide] = useState<(typeof SIDES)[number]>("bottom")

  return (
    <div className="flex flex-col items-center gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Side</legend>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {SIDES.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="popover-side"
                value={s}
                checked={side === s}
                onChange={() => setSide(s)}
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open</Button>
        </PopoverTrigger>
        <PopoverContent arrow side={side}>
          <p className="text-sm">Popover body</p>
        </PopoverContent>
      </Popover>
    </div>
  )
}
