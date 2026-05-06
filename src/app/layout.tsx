import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: { default: "Site", template: "%s — Site" },
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
