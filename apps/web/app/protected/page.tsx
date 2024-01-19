import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Client from "@/components/ui/client";
import { authOptions } from "../api/auth/[...nextauth]/util";

export default async function ProtectedRoute() {
  const session = await getServerSession(authOptions);
  // if (!session || !session.user) {
  //   redirect("/signup");
  // }
  
  return (
    <div>
      This is a protected route.
      <br />
      You will only see this if you are authenticated.
      {session?.user?.email}
      {/* {session?.user?.jwt} */}
      <Client />
    </div>
  );
}
