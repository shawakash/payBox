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
import AccountCreateForm from "./components/account-create-form";

interface AccountCreateProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function AccountCreate({
    className,
    ...props
}: AccountCreateProps) {

    return (
        <div className="">
            <AccountCreateForm />
        </div>
    );
}
