import { Metadata } from "next";
import { authOptions } from "../api/auth/[...nextauth]/util";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SideNav } from "../components/Client/sidenav";
import {
    AlertCircle,
    Archive,
    ArchiveX,
    File,
    Inbox,
    MessagesSquare,
    PenBox,
    Search,
    Send,
    ShoppingCart,
    Trash2,
    Users2,
} from "lucide-react"
import SideNavWrapper from "./components/side-nav-wrapper";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "PayBox | Wallet",
    description: "By Akash Shaw",
};

export default async function WalletLayout({
    children,
}: {
    children: React.ReactNode,
}) {

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/signup")
    }
    const layout = cookies().get("react-resizable-panels:layout")
    const collapsed = cookies().get("react-resizable-panels:collapsed")

    const defaultLayout = undefined
    const defaultCollapsed = undefined

    return (
        <>
            {/* <SideNavWrapper
                defaultLayout={defaultLayout}
                defaultCollapsed={defaultCollapsed}
                navCollapsedSize={4}
                children={children}

            /> */}
            {children}
        </>
    )
}