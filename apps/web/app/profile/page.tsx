import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "./profile-form"
import { useSession } from "next-auth/react"
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/util";
import { BACKEND_URL, ClientWithJwt } from "@paybox/common";
import { headers } from "next/headers";

export default async function SettingsProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user?.email) {
      redirect("/signup");
    }
    const me = await fetch(`${BACKEND_URL}/client/me`, {
      method: "get",
      headers: {
        //@ts-ignore
        "authorization": `Bearer ${session.user.jwt}`
      },
      next: { revalidate: 3600 }
    }).then(res => res.json());
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <ProfileForm me={me as unknown as ClientWithJwt} />
    </div>
  )
}