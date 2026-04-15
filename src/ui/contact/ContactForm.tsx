"use client";

import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Textarea } from "@/ui/components/ui/textarea";
import { useContactForm } from "@/ui/contact/hooks/useContactForm";
import { Loader2, Send } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const { form, onSubmit, isSubmitting, submitResult } = useContactForm();
  const {
    register,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!submitResult) return;

    if (submitResult.success) {
      // @template:i18n-start
      toast.success("Message sent! I'll get back to you soon.");
      // @template:i18n-end
    } else {
      // @template:i18n-start
      toast.error(submitResult.error ?? "Something went wrong. Please try again.");
      // @template:i18n-end
    }
  }, [submitResult]);

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Contact form">
      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          {/* @template:i18n-start */}
          Name
          {/* @template:i18n-end */}
        </label>
        <Input
          id="name"
          {...register("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          placeholder="Your name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {/* @template:i18n-start */}
          Email
          {/* @template:i18n-end */}
        </label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          {/* @template:i18n-start */}
          Message
          {/* @template:i18n-end */}
        </label>
        <Textarea
          id="message"
          {...register("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          placeholder="Tell me about your project..."
          disabled={isSubmitting}
          className="min-h-32"
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {/* @template:i18n-start */}
        Send Message
        {/* @template:i18n-end */}
      </Button>
    </form>
  );
}
