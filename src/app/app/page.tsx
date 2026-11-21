import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import AppClient from "./AppClient";

export const dynamic = "force-dynamic";

export default async function AppPage({ searchParams }: { searchParams: Promise<{ analyse?: string }> }) {
  const { analyse } = await searchParams;
  const user = await currentUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(analyse ? `/app?analyse=${analyse}` : "/app")}`);
  return <AppClient email={user.email} analyse={analyse} />;
}
