import { Metadata } from "next";
import { authOptions } from "../api/auth/[...nextauth]/util";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SideNav } from "../components/Client/sidenav";
import SideNavWrapper from "./components/side-nav-wrapper";
import { cookies } from "next/headers";
import { BACKEND_URL, WalletType } from "@paybox/common";

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