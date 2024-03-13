"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {AccountCreateForm} from "../../account/create/components/account-create-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/util";
import { redirect } from "next/navigation";
import { BACKEND_URL, WalletType } from "@paybox/common";

interface AccountCreateProps extends React.HTMLAttributes<HTMLDivElement> { }

const getWallets = async (jwt: string): Promise<WalletType[] | null> => {
    try {
        const response = await fetch(`${BACKEND_URL}/wallet/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
        }).then((res) => res.json());
        return response.wallets;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export default async function AccountCreate({
    className,
    ...props
}: AccountCreateProps) {

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/signup")
    }

    //@ts-ignore
    const wallets = await getWallets(session.user.jwt);
    console.log(wallets?.map(wallet => wallet.id))

    return (
        <div className="">
            <AccountCreateForm 
                walletIds={wallets?.map(wallet => wallet.id) || []}
            />
        </div>
    );
}
