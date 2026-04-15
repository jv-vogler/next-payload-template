import type { Metadata } from "next";
import { getSettings } from "@/lib/payload";
import "@/app/globals.css";

export const generateMetadata = async (): Promise<Metadata> => {
  const settings = await getSettings();
  return {
    title: {
      default: settings?.siteName ?? "Site",
      template: `%s — ${settings?.siteName ?? "Site"}`,
    },
    description: settings?.description ?? "",
  };
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
