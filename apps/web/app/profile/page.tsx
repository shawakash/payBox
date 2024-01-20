import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "./profile-form"
import { useSession } from "next-auth/react"
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/util";

export default async function SettingsProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
    redirect("/signup");
  }
  console.log(session);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  )
}