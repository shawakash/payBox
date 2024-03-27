import { Metadata } from "next";

import { cookies } from "next/headers";
import { AccountLayout } from "@/app/account/components/accountLayout";
import { AccountType, BACKEND_URL, responseStatus } from "@paybox/common";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/util";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Account | PayBox",
  description: "Account | PayBox",
};


interface AccountLayoutProps {
  children: React.ReactNode;
}

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

export default async function AccountMainLayout({
  children,
}: AccountLayoutProps) {
  const layout = cookies().get("react-resizable-panels:layout");
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user?.email) {
    redirect("/signup");
  }

  //@ts-ignore
  const accounts = await getAccounts(session.user.jwt);

  return (
    <>
      {accounts && <AccountLayout
        defaultLayout={defaultLayout}
        navCollapsedSize={4}
        children={children}
        accounts={accounts}
      />}
    </>
  );
}
