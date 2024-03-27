"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { date, z } from "zod";
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
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "./avatar-upload";
import { accountsAtom, defaultAccountNumberAtom } from "@paybox/recoil";
import {useSetRecoilState} from "recoil";

interface AccountCreateProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultAccountNumber: number,
    putUrl: string,
    jwt: string
}

export function AccountCreateForm({
    defaultAccountNumber,
    jwt,
    putUrl
}: AccountCreateProps) {
    const [isLoading, setIsLoading] = useRecoilState(loadingAtom);
    const router = useRouter();
    const [defaultNumber, setDefaultAccountNumber] = useRecoilState(defaultAccountNumberAtom);
    const setAccounts = useSetRecoilState(accountsAtom);

    React.useEffect(() => {
        setDefaultAccountNumber(defaultAccountNumber);
    }, [defaultAccountNumber])

    const form = useForm<z.infer<typeof AccountCreateQuery>>({
        resolver: zodResolver(AccountCreateQuery),
        defaultValues: {
            name: `Account ${defaultNumber}`,
            imgUrl: undefined
        },
    });

    async function onSubmit(values: z.infer<typeof AccountCreateQuery>) {
        const call = async () => {
            try {
                let accountQueryUrl = `${BACKEND_URL}/account?name=${values.name}`;
                try {
                    if (values.imgUrl && putUrl) {
                        const putResponse = await fetch(putUrl, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "image/*",
                            },
                            body: values.imgUrl
                        });
                        if (putResponse) {
                            accountQueryUrl += `&imgUrl=${putUrl}`
                            toast.success("Image uploaded successfully");
                        }
                    }
                } catch (error) {
                    console.log(error);
                    toast.error("Error uploading image");
                }

                const response = await fetch(accountQueryUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${jwt}`
                    },
                }).then(res => res.json());
                setAccounts((oldAccounts) => {
                    return [...oldAccounts, response.account]
                });
                setDefaultAccountNumber((oldNumber) => {
                    return oldNumber + 1;
                });
                return { account: response.account, status: response.status, msg: response.msg }
            } catch (error) {
                throw new Error("Error creating Account");
            }
        }
        toast.promise(call(), {
            loading: "Creating Account...",
            success({ account, status, msg }: { account: AccountType, status: responseStatus, msg: string }) {
                if (status == responseStatus.Error) {
                    return toast.error(msg)
                }
                //TODO: set the account to the atom
                return `Account '${account.name}' Created Successfully`
            },
            error({ status, msg }: { status: responseStatus, msg: string }) {
                return msg
            },
        });
        router.push('/account/');
    }

   

    return (
        <div className="flex items-center justify-center">
            <Card className="w-[450px]">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Your New Web3 Account in just a click.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={cn("grid gap-6")}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-5">
                                    <div className="flex flex-row justify-center items-center gap-x-5">
                                        <FormField
                                            control={form.control}
                                            name="imgUrl"
                                            render={({ field }) => (
                                                <FormItem className="w-fit">

                                                    <FormControl>
                                                        <AvatarUpload
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            fallbackName={`A${defaultNumber}`}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel htmlFor="name" className="w-fit h-fit">
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
                                    </div>
                                    <Button type="submit"><RocketIcon /> <p>Create An Account</p> </Button>
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
