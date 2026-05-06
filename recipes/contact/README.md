# Contact recipe

Adds a Resend-backed contact form with:

- Server action (`src/app/actions/contact.ts`) that validates with Zod and
  sends mail via Resend
- `useContactForm()` hook with **lazy validation** (silent while typing,
  validates on blur, re-validates on change once errored)
- `<ContactForm />` with reserved-height field hints (idle / valid / invalid)
  and `role="alert"` for screen readers
- `<ContactSection />` wrapping the form in a centered section

## What gets installed

```
src/core/contact.ts
src/app/actions/contact.ts
src/ui/contact/ContactForm.tsx
src/ui/contact/ContactSection.tsx
src/ui/contact/hooks/useContactForm.ts
```

Dependencies added: `resend`, `react-hook-form`, `@hookform/resolvers`.

## Environment

| Variable             | Required | Purpose                                                                              |
| -------------------- | -------- | ------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`     | yes      | Resend API key                                                                       |
| `CONTACT_EMAIL_TO`   | yes      | Inbox to deliver messages to                                                         |
| `CONTACT_EMAIL_FROM` | no       | Defaults to `onboarding@resend.dev`. Set to a verified domain sender for production. |

## Wiring it in

```tsx
// src/app/page.tsx
import { ContactSection } from "@/ui/contact/ContactSection";

export default function HomePage() {
  return (
    <main>
      {/* …other sections… */}
      <ContactSection />
    </main>
  );
}
```

Or import the form directly and place it however you like:

```tsx
import { ContactForm } from "@/ui/contact/ContactForm";
```

## Customising copy

All strings are English placeholders. The ones you'll likely want to change:

| File                                | What                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `src/ui/contact/ContactSection.tsx` | Heading "Get in touch", subtitle                                    |
| `src/ui/contact/ContactForm.tsx`    | Field labels, placeholders, success/error copy, submit button label |
| `src/core/contact.ts`               | Zod validation messages                                             |

The validation messages live on the schema (single source of truth) so they
appear identically client- and server-side.

## Customising the look

The form uses the base shadcn primitives (`Input`, `Textarea`, `Button`,
`Label`) and the standard token names (`text-destructive`,
`text-muted-foreground`, `text-foreground`). Restyle by editing those tokens
in your Tailwind theme, not the component.
