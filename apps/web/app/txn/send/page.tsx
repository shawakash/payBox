
import { authOptions } from "@/app/api/auth/[...nextauth]/util";
import { BACKEND_URL, ClientWithJwt } from "@paybox/common";
import { Metadata } from "next"
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { PaymentCard } from "./components/txnSend";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Txns Send",
  description: "Transaction Billdesk | PayBox",
}


const getCode = async (clientId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/qrcode/get?id=${clientId}`, {
      method: "get",
      headers: headers(),
    }).then(res => res.blob());
    const imageUrl = URL.createObjectURL(response);
    return imageUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function SendTxn({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user?.email) {
      redirect("/signup");
    }
  console.log(session.user, "from session")
  //@ts-ignore
  const qrcode = await getCode(session?.user.id);
  return (
    <>
      <div className="flex justify-center items-center w-screen">
        <PaymentCard address={searchParams} client={session.user as ClientWithJwt} />
      </div>
    </>
  )
}