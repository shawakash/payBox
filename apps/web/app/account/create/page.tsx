import { authOptions } from "@/app/api/auth/[...nextauth]/util"
import { BACKEND_URL, responseStatus } from "@paybox/common";
import { getServerSession } from "next-auth"
import { AccountCreateForm } from "./components/account-create-form";

const getDefaultName = async (jwt: string): Promise<string | null> => {
    try {
        const {status, number}: {status: responseStatus, number: number} = await fetch(`${BACKEND_URL}/account/totalAccount`, {
            method: "get",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${jwt}`
            }
        }).then(res => res.json());
        if(status == responseStatus.Error) {
            return null;
        }
        return `Account ${number + 1}`;
    } catch (error) {
        console.error(error)
        return null;
    }
}

export default async function AccountCreatePage(){
    const session = await getServerSession(authOptions);

    //@ts-ignore
    const name = await getDefaultName(session?.user.jwt);

  return (
    <>
        <AccountCreateForm 
            defaultAccountName={name || ""}
            //@ts-ignore
            jwt={session?.user.jwt}
        />
    </>
  )
}
