import { authOptions } from "@/app/api/auth/[...nextauth]/util"
import { BACKEND_URL, responseStatus } from "@paybox/common";
import { getServerSession } from "next-auth"
import { AccountCreateForm } from "./components/account-create-form";

const getDefaultMetadata = async (jwt: string): Promise<{number: number, putUrl: string} | null> => {
    try {
        const {status, putUrl, number}: {status: responseStatus, putUrl: string, number: number} = await fetch(`${BACKEND_URL}/account/defaultMetadata`, {
            method: "get",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${jwt}`
            }
        }).then(res => res.json());
        if(status == responseStatus.Error) {
            return null;
        }
        return {
            number: number + 1,
            putUrl
        };
    } catch (error) {
        console.error(error)
        return null;
    }
}

export default async function AccountCreatePage(){
    const session = await getServerSession(authOptions);

    //@ts-ignore
    const {number, putUrl} = await getDefaultMetadata(session?.user.jwt);
  return (
    <>
        <AccountCreateForm 
            defaultAccountNumber={number as number}
            putUrl={putUrl || ""}
            //@ts-ignore
            jwt={session?.user.jwt}
        />
    </>
  )
}
