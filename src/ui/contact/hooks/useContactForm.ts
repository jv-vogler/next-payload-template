"use client";

import { sendContactEmail, type ContactActionResult } from "@/app/actions/contact";
import { Contact } from "@/core/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export function useContactForm() {
  const [submitResult, setSubmitResult] = useState<ContactActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<Contact.FormValues>({
    // Zod v4.3 types not fully supported by @hookform/resolvers yet — runtime works correctly
    resolver: zodResolver(Contact.formSchema as any),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (values: Contact.FormValues) => {
    setSubmitResult(null);
    startTransition(async () => {
      const result = await sendContactEmail(values);
      setSubmitResult(result);

      if (result.success) {
        form.reset();
      }
    });
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: isPending,
    submitResult,
  };
}
