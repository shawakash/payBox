"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { toast } from "sonner";
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AccountGetPrivateKey, BACKEND_URL, responseStatus } from "@paybox/common"
import { CardContent, CardFooter } from "@/components/ui/card"
import { PrivateKeyDialogBox } from "./key-dialog-box"
import { useRecoilState, useSetRecoilState } from "recoil"
import { accountPrivateKeysAtom } from "@paybox/recoil"
import { decryptWithPassword } from "@/lib/helper"


const PrivateKeyFrom = ({
    accountId,
    jwt
}: {
    accountId: string,
    jwt: string
}) => {

    const [checked, setChecked] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState<boolean>(false);
    const setPrivateKey = useSetRecoilState(accountPrivateKeysAtom);

    const form = useForm<z.infer<typeof AccountGetPrivateKey>>({
        resolver: zodResolver(AccountGetPrivateKey),
        defaultValues: {
            password: "",
            accountId
        },
    });

    function onSubmit(data: z.infer<typeof AccountGetPrivateKey>) {
        const call = async () => {
            const {status, sol, eth, hashPassword, msg}: {
                status: responseStatus, sol: {privateKey: string}, eth: {privateKey: string}, hashPassword: string, msg: string
            } = await fetch(`${BACKEND_URL}/account/privateKey`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}`
                },
                body: JSON.stringify(data),
                cache: "force-cache"
            }).then(res => res.json());

            if (status == responseStatus.Error) {
               return Promise.reject(msg);
            }
            return {status, sol, eth, hashPassword, msg};
        }

        toast.promise(call(), {
            loading: "Fetching Private Key...",
            success: ({status, sol, eth, hashPassword}) => {
                setPrivateKey([ 
                    {network: "Solana", privateKey: decryptWithPassword(sol.privateKey, hashPassword)},
                    {network: "Ethereum", privateKey: decryptWithPassword(eth.privateKey, hashPassword)}
                ]);
                setOpen(true);
                return toast.success("Private Key Fetched Successfully");
            },
            error: (error) => {
                return toast.error(error);
            }
        });
    }

    const setCheckedFn = (check: boolean) => {
        setChecked(check)
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Your Password..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-y-5">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="terms_for_privateKey"
                                checked={checked}
                                onCheckedChange={setCheckedFn}
                            />
                            <label
                                htmlFor="terms_for_privateKey"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I will not share my private key with anyone, including PayBox.
                            </label>
                        </div>
                        <Button className="w-full" disabled={!checked} type="submit">Submit</Button>
                    </CardFooter>
                </form>
            </Form>
            {open &&
                <PrivateKeyDialogBox
                    open={open}
                    setOpen={setOpen}
                />}
        </>
    )
}



export default PrivateKeyFrom

