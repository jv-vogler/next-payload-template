"use server";

import { Contact } from "@/core/contact";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; error?: string };

export async function sendContactEmail(values: Contact.FormValues): Promise<ContactActionResult> {
  const result = Contact.formSchema.safeParse(values);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, errors: fieldErrors };
  }

  const { name, email, message } = result.data;

  try {
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_EMAIL_FROM ?? "onboarding@resend.dev",
      to: process.env.CONTACT_EMAIL_TO ?? "",
      subject: `Portfolio Contact: ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: "Failed to send message" };
    }

    return { success: true };
  } catch (err) {
    console.error("Contact email error:", err);
    return { success: false, error: "Failed to send message" };
  }
}
