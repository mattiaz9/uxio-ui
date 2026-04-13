import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"

export default function AccordionDefault() {
  return (
    <Accordion className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Account</AccordionTrigger>
        <AccordionContent>
          Manage your profile, email, and connected accounts.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Billing</AccordionTrigger>
        <AccordionContent>
          Invoices, payment methods, and subscription details.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionContent>
          Choose how we reach you about product updates and security.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
