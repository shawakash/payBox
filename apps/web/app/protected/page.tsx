import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Client from "@/components/ui/client";

export default async function ProtectedRoute() {
  const session = await getServerSession();
  console.log("from protecrted", session);
  if (!session || !session.user) {
    redirect("/signup");
  }
  
  return (
    <div>
      This is a protected route.
      <br />
      You will only see this if you are authenticated.
      <Client />
    </div>
  );
}
