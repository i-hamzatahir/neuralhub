import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { unsubscribeNewsletterAction } from "@/lib/actions/newsletter";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = { title: "Unsubscribe" };

export default async function NewsletterUnsubscribePage({
  searchParams,
}: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/newsletter?error=invalid");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-display text-2xl font-semibold">Unsubscribe</h1>
      <p className="mt-3 text-muted-foreground">
        Confirm that you want to unsubscribe from the NeuralHub newsletter.
      </p>
      <form action={unsubscribeNewsletterAction} className="mt-8">
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="outline">
          Unsubscribe
        </Button>
      </form>
    </div>
  );
}
