import { promises as fs, stat } from "fs"
import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/util"
import { BACKEND_URL, Network, TxnType, responseStatus } from "@paybox/common"

export const metadata: Metadata = {
  title: "Txns",
  description: "Transactions Table for Client of PayBox",
}


const getTxns = async (jwt: string, count: number, networks: Network[]): Promise<TxnType[] | null> => {
  try {
    const apiUrl = `${BACKEND_URL}/txn/getMany?${networks.map(network => `networks=${network}`).join('&')}&count=${count}`;
    const {status, txns}: {txns: TxnType[], status: responseStatus} = await fetch(apiUrl, {
      method: "get",
      headers: {
        "Content-type": "application/json",
        "authorization": `Bearer ${jwt}`
      },
      cache: "no-store",
      next: {
        revalidate: 5,
        tags: ['getTxns']
      }
    }).then(res => res.json());
    if(status == responseStatus.Error) {
      return null;
    }
    console.log(txns);
    return txns;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default async function TxnPage() {
  const session = await getServerSession(authOptions);
  //@ts-ignore
  const txns = await getTxns(session?.user?.jwt, 4, [Network.Sol, Network.Eth]);
  return (
    <>
      <div className="flex flex-col w-screen items-center">
        <div className="w-5/6 hidden h-full flex-1 flex-col border-2 rounded-lg space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your Transactions for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
       {txns && <DataTable data={txns} columns={columns} />}
        </div>
      </div>
    </>
  )
}