import { z } from "zod";

export namespace Contact {
  export type FormValues = {
    name: string;
    email: string;
    message: string;
  };

  export const formSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    message: z.string().min(20),
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
