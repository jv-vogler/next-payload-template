import { ContactForm } from "@/ui/contact/ContactForm";

export function ContactSection() {
  return (
    <section id="contact" className="relative py-16 sm:py-24" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-[800px] px-6">
        <div>
          <h2
            id="contact-heading"
            className="mb-4 text-center text-3xl font-bold text-foreground sm:text-4xl"
          >
            Get in touch
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            Send me a message and I'll get back to you.
          </p>

          <div className="mx-auto max-w-lg">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
