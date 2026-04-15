import { getSettings } from "@/lib/payload";

export default async function Home() {
  const settings = await getSettings();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{settings?.siteName ?? "New site"}</h1>
      <p className="mt-4 text-muted-foreground">
        {settings?.description ?? "Edit the Settings global in the Payload admin."}
      </p>
    </main>
  );
}
