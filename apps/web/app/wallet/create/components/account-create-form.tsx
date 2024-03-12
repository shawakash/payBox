"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    AccountCreateQuery,
    AccountType,
    BACKEND_URL,
    responseStatus,
} from "@paybox/common";
import { ToastAction } from "@radix-ui/react-toast";
import { useRecoilState } from "recoil";
import { loadingAtom } from "@paybox/recoil";
import { RocketIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface AccountCreateProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function AccountCreateForm({
    className,
    ...props
}: AccountCreateProps) {
    const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
    const session = useSession();
    // get the walletId from atom

    const form = useForm<z.infer<typeof AccountCreateQuery>>({
        resolver: zodResolver(AccountCreateQuery),
        defaultValues: {
            name: "",
            walletId: "ee4ea4a6-c4e0-49fc-806d-851399628c2d"
        },
    });

    async function onSubmit(values: z.infer<typeof AccountCreateQuery>) {
        toast.promise(fetch(`${BACKEND_URL}/account?name=${values.name}&walletId=${values.walletId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //@ts-ignore
                "Authorization": `Bearer ${session.data?.user.jwt}`
            },
        }).then(res => res.json()), {
            success({ account, status }: { account: AccountType, status: responseStatus }) {
                //TODO: set the account to the atom
                return `Account '${account.name}' Created Successfully`
            },
            error({ status, msg }: { status: responseStatus, msg: string }) {
                return msg
            },
        })
    }
    return (
        <div className="flex items-center justify-center">
            <Card className="w-[450px]">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Your New Web3 Account in just a click.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={cn("grid gap-6", className)} {...props}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-5">
                                    <div className="grid grid-flow-row gap-y-5">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="grid gap-1">
                                                    <FormLabel htmlFor="name">
                                                        Account Name
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            id="name"
                                                            placeholder="Account name"
                                                            type="text"
                                                            autoCapitalize="words"
                                                            autoComplete="name"
                                                            autoCorrect="off"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="walletId"
                                            render={({ field }) => (
                                                <FormItem className="grid gap-1">
                                                    <FormLabel htmlFor="walletId">
                                                        WalletId
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            id="lastname"
                                                            placeholder="WalletId"
                                                            type="text"
                                                            autoCorrect="off"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        disabled={isLoading}
                                        type="submit"
                                        onSubmit={() => setIsLoading(true)}
                                        className="flex items-center space-x-4"
                                    >
                                        {isLoading && (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        <RocketIcon /> <p>Create An Account</p>
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Is it accessible?</AccordionTrigger>
                            <AccordionContent>
                                Yes. It adheres to the WAI-ARIA design pattern.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardFooter>
            </Card>
        </div>

    );
}
