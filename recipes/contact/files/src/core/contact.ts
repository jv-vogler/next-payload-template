import { z } from "zod";

export namespace Contact {
  export type FormValues = {
    name: string;
    email: string;
    message: string;
  };

  export const formSchema = z.object({
    name: z.string().min(2, "Please enter your name."),
    email: z.email("Please enter a valid email."),
    message: z.string().min(20, "Tell us a little more — at least 20 characters."),
  });

  export namespace Errors {
    export class SubmissionError extends Error {
      constructor(message = "Failed to submit contact form") {
        super(message);
        this.name = "SubmissionError";
      }
    }
  }
}
