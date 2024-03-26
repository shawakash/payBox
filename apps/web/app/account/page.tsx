import { Separator } from "@/components/ui/separator";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/util";
import { AccountType, BACKEND_URL, ClientWithJwt, responseStatus } from "@paybox/common";

const getAccounts = async (jwt: string): Promise<AccountType[] | null> => {
    try {
        const { status, accounts }: { status: responseStatus, accounts: AccountType[] } = await fetch(`${BACKEND_URL}/account/all`, {
            method: "get",
            headers: {
                "Content-type": "application/json",
                authorization: `Bearer ${jwt}`,
            },
            cache: "no-cache"
        }).then(res => res.json());
        if (status == responseStatus.Error) {
            return null
        }
        return accounts
    } catch (error) {
        console.log(error);
        return null
    }
}

export default async function AccountPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user?.email) {
        redirect("/signup");
    }

    //@ts-ignore
    const accounts = await getAccounts(session.user.jwt);
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site. Fuck ou
                </p>
            </div>
            {/* {accounts &&
             <AccountNav accounts={accounts}/>    
            } */}
            <Separator />
        </div>
    );
}
