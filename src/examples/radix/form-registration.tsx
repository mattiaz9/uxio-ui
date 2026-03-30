"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { Button } from "./ui/button"
import { Form } from "./ui/form"
import { Input } from "./ui/input"
import { InputCurrency } from "./ui/input-currency"
import { InputDatetime } from "./ui/input-datetime"
import { InputDuration } from "./ui/input-duration"
import { InputFraction } from "./ui/input-fraction"
import { InputNumber } from "./ui/input-number"
import { InputPassword } from "./ui/input-password"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

const registrationSchema = z.object({
  username: z.string().trim().min(2, "Username must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birthDate: z
    .union([z.date(), z.null()])
    .refine((d) => d !== null, { message: "Select your birth date" }),
  hourlyRate: z
    .string()
    .min(1, "Enter an hourly rate")
    .refine((s) => {
      const n = Number.parseFloat(s.replaceAll(/[^0-9.-]/g, ""))
      return !Number.isNaN(n) && n > 0
    }, "Enter a valid amount"),
  coffeeBreaksPerDay: z
    .union([z.number(), z.null()])
    .refine((v) => v != null && v >= 0 && v <= 10, {
      message: "Must be between 0 and 10",
    }),
  typicalBreakDuration: z
    .union([z.number(), z.null()])
    .refine((v) => v != null && v >= 60 && v <= 28800, {
      message: "Between 1 minute and 8 hours",
    }),
  weeklyRemoteFraction: z
    .union([z.string(), z.null()])
    .refine((v) => {
      if (v == null || !/^\d+\/\d+$/.test(v)) return false
      const [n, d] = v.split("/").map((x) => Number.parseInt(x, 10))
      return n >= 0 && n <= 5 && d === 5
    }, {
      message: "Use a fraction from 0/5 to 5/5",
    }),
})

export default function FormRegistrationExample() {
  const id = React.useId()
  const [submittedJson, setSubmittedJson] = React.useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      birthDate: null,
      hourlyRate: "",
      coffeeBreaksPerDay: null,
      typicalBreakDuration: null,
      weeklyRemoteFraction: null,
    } as unknown as z.input<typeof registrationSchema>,
    validators: {
      onSubmit: registrationSchema,
    },
    onSubmit: ({ value }) => {
      setSubmittedJson(
        JSON.stringify(
          {
            username: value.username,
            password: "[redacted]",
            birthDate: value.birthDate ? value.birthDate.toLocaleDateString() : null,
            hourlyRate: value.hourlyRate,
            coffeeBreaksPerDay: value.coffeeBreaksPerDay,
            typicalBreakDurationSeconds: value.typicalBreakDuration,
            weeklyRemoteWorkFraction: value.weeklyRemoteFraction,
          },
          null,
          2,
        ),
      )
    },
  })

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Form form={form} className="gap-4">
        <FieldGroup>
          <form.Field name="username">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={`${id}-${field.name}`}>Username</FieldLabel>
                  <Input
                    id={`${id}-${field.name}`}
                    name={field.name}
                    autoComplete="username"
                    placeholder="jane.doe"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>Shown on your public profile.</FieldDescription>
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={`${id}-${field.name}`}>Password</FieldLabel>
                  <InputPassword
                    id={`${id}-${field.name}`}
                    name={field.name}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="birthDate">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={`${id}-${field.name}`}>Birth date</FieldLabel>
                  <InputDatetime
                    id={`${id}-${field.name}`}
                    mode="date"
                    value={field.state.value ?? undefined}
                    onValueChange={(d) => field.handleChange(d)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="hourlyRate">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={`${id}-${field.name}`}>Hourly rate (USD)</FieldLabel>
                  <InputCurrency
                    id={`${id}-${field.name}`}
                    currency="USD"
                    locale="en-US"
                    placeholder="0"
                    min={0}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onValueChange={(v) => field.handleChange(v ?? "")}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="coffeeBreaksPerDay">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={`${id}-${field.name}`}>Coffee breaks per day</FieldLabel>
                  <InputNumber
                    id={`${id}-${field.name}`}
                    min={0}
                    max={24}
                    step={1}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onValueChange={(v) => field.handleChange(v)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="typicalBreakDuration">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={`${id}-${field.name}`}>Average break length</FieldLabel>
                  <InputDuration
                    id={`${id}-${field.name}`}
                    format="mm'm' ss's'"
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>Minutes and seconds (e.g. 15m 00s).</FieldDescription>
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="weeklyRemoteFraction">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={`${id}-${field.name}`}>
                    Remote work days (numerator / week)
                  </FieldLabel>
                  <InputFraction
                    id={`${id}-${field.name}`}
                    minNumerator={0}
                    maxNumerator={5}
                    minDenominator={5}
                    maxDenominator={5}
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>Example: 2/5 for two remote days out of five.</FieldDescription>
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>
        </FieldGroup>

        <Button type="submit">Create account</Button>
      </Form>

      {submittedJson ? (
        <div className="grid gap-2">
          <p className="text-sm font-medium">Submitted values</p>
          <code className="block overflow-x-auto rounded-md border border-border bg-muted/50 p-3 text-xs leading-relaxed">
            {submittedJson}
          </code>
        </div>
      ) : null}
    </div>
  )
}
