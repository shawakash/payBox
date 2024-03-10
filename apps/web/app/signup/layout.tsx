import { Metadata } from "next";
import { authOptions } from "../api/auth/[...nextauth]/util";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "PayBox | Signup",
    description: "By Akash Shaw",
};

export default async function SignupLayout({
    children,
}: {
    children: React.ReactNode,
}) {

    const session = await getServerSession(authOptions);
    //@ts-ignore
    if (session?.user.valid) {
        redirect("/profile")
    }

    return <section>{children}</section>
}