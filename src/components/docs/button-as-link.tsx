import { buttonVariants } from "@/components/ui/button"

export function ButtonAsLink() {
  return (
    <a
      href="#login"
      className={buttonVariants({ variant: "secondary", size: "sm" })}
    >
      Login
    </a>
  )
}
