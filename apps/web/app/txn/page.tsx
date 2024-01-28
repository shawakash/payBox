import { promises as fs, stat } from "fs"
import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"
import { taskSchema } from "./data/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/util"
import { BACKEND_URL, Network, TxnType, responseStatus } from "@paybox/common"

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
}

// Simulate a database read for tasks.
async function getTasks() {
  const data = await fs.readFile(
    path.join(process.cwd(), "app/txn/data/tasks.json")
  )

  const tasks = JSON.parse(data.toString())

  return z.array(taskSchema).parse(tasks)
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
      next: {
        revalidate: 5
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

export default async function TaskPage() {
  const tasks = await getTasks();
  const session = await getServerSession(authOptions);
  //@ts-ignore
  const txns = await getTxns(session?.user?.jwt, 4, [Network.Sol, Network.Eth]);
  return (
    <>
      <div className="flex flex-col w-screen items-center">
        <div className="w-4/5 hidden h-full flex-1 flex-col border-2 rounded-lg space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <DataTable data={tasks} columns={columns} />
        </div>
      </div>
    </>
  )
}