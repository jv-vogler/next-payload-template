"use client";

import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Textarea } from "@/ui/components/ui/textarea";
import { useContactForm } from "@/ui/contact/hooks/useContactForm";
import { Loader2, Send } from "lucide-react";
import type { ReactNode } from "react";

type FieldStatus = "idle" | "valid" | "invalid";

type FieldHintProps = {
  id: string;
  status: FieldStatus;
  message?: string;
  validMessage: string;
  children?: ReactNode;
};

function FieldHint({ id, status, message, validMessage, children }: FieldHintProps) {
  const visible = status !== "idle";
  return (
    <p
      id={id}
      role={status === "invalid" ? "alert" : undefined}
      aria-hidden={!visible}
      className="min-h-[1.25rem] text-sm"
      data-status={status}
    >
      {status === "invalid" && message ? (
        <span className="text-destructive">{message}</span>
      ) : status === "valid" ? (
        <span className="text-muted-foreground">{validMessage}</span>
      ) : (
        (children ?? " ")
      )}
    </p>
  );
}

export function ContactForm() {
  const { form, onSubmit, isSubmitting, submitResult } = useContactForm();
  const {
    register,
    formState: { errors, touchedFields },
  } = form;

  const isSuccess = !!submitResult?.success;
  const hasSubmitError = !!submitResult && !submitResult.success;

  const fieldStatus = (name: keyof typeof touchedFields, hasError: boolean): FieldStatus => {
    if (hasError) return "invalid";
    if (touchedFields[name]) return "valid";
    return "idle";
  };

  if (isSuccess) {
    return (
      <div role="status" aria-live="polite" className="space-y-3 rounded-md border p-6">
        <p className="text-base font-medium">Thanks — your message is on its way.</p>
        <p className="text-sm text-muted-foreground">I'll get back to you as soon as I can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Contact form" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          autoComplete="name"
          {...register("name")}
          aria-invalid={!!errors.name}
          aria-describedby="contact-name-hint"
          placeholder="Your name"
          disabled={isSubmitting}
        />
        <FieldHint
          id="contact-name-hint"
          status={fieldStatus("name", !!errors.name)}
          message={errors.name?.message}
          validMessage="Got it."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby="contact-email-hint"
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
        <FieldHint
          id="contact-email-hint"
          status={fieldStatus("email", !!errors.email)}
          message={errors.email?.message}
          validMessage="Looks good."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
          aria-describedby="contact-message-hint"
          placeholder="Tell me a little about what you're looking for…"
          disabled={isSubmitting}
          className="min-h-32"
        />
        <FieldHint
          id="contact-message-hint"
          status={fieldStatus("message", !!errors.message)}
          message={errors.message?.message}
          validMessage="Thanks — that's plenty to start."
        />
      </div>

      {hasSubmitError ? (
        <p role="alert" className="text-sm text-destructive">
          Something went wrong sending your message. Please try again.
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        <span>{isSubmitting ? "Sending…" : "Send message"}</span>
      </Button>
    </form>
  );
}
