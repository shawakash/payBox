import { cookies } from "next/headers"
import Image from "next/image"

import { Mail } from "@/app/wallet/components/mail"
import { accounts, mails } from "@/app/wallet/data"

export default function MailPage() {
  const layout = cookies().get("react-resizable-panels:layout")
  const collapsed = cookies().get("react-resizable-panels:collapsed")

  const defaultLayout = undefined
  const defaultCollapsed = undefined

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/wallet-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/wallet-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}