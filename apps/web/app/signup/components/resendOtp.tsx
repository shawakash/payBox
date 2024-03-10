"use client"
import { CopyIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BACKEND_URL, ResendOtpValid } from "@paybox/common";
import { useSession } from "next-auth/react"
import React from "react"
import { toast } from "sonner"


export function ResendOtp() {

    const session = useSession();

    const formRef = React.useRef<HTMLFormElement>(null)
    const form = useForm<z.infer<typeof ResendOtpValid>>({
        resolver: zodResolver(ResendOtpValid),
        defaultValues: {
            email: session.data?.user?.email ?? "",
            //@ts-ignore
            mobile: (session.data?.user?.mobile || "").toString() ?? "",
            //@ts-ignore
            name: session.data?.user?.firstname ?? ""
        },
    })

    const onSubmit = async (data: z.infer<typeof ResendOtpValid>) => {
        console.log("here")
        const call = async () => {
            try {     
                const { status, msg }: { status: string, msg: string } =
                    await fetch(`${BACKEND_URL}/client/resend?mobile=${data.mobile}&email=${data.email}&name=Akash`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            //@ts-ignore
                            "Authorization": `Bearer ${session.data?.user?.jwt}`
                        },
                    }).then((res) => res.json());
                    return {status, msg}
            } catch (error) {
                throw new Error("Error in sending otp")
                return {error}
            }
        }
        toast.promise(call(), {
            loading: "Re-Sending otp...",
            success: ({status, msg}) => {
              return msg;
            },
            error: ({e}) => {
              console.error(e);
              return `Error in sending otp: ${e.message}`;
            },
          });
    }
    return (
        <Form {...form}>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="link">Resend Otp</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>Resend Otp</DialogTitle>
                            <DialogDescription>
                                Re-check your email or phone for the OTP to send.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col space-y-3 pt-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="" htmlFor="mobile">
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        //@ts-ignore
                                                        placeholder={`${session.data?.user?.firstname}`}
                                                        autoComplete="firstname"
                                                        autoCorrect="off"
                                                        {...field}
                                                    />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="" htmlFor="mobile">
                                            Mobile
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Input
                                                        id="mobile"
                                                        type="text"
                                                        //@ts-ignore
                                                        placeholder={`${session.data?.user?.mobile}`}
                                                        autoComplete="mobile"
                                                        autoCorrect="off"
                                                        {...field}
                                                    />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="grid gap-1">
                                        <FormLabel className="" htmlFor="email">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <div className="grid flex-1 gap-2">
                                                    <Input
                                                        id="email"
                                                        type="text"
                                                        placeholder={`${session.data?.user?.email}`}
                                                        autoComplete="email"
                                                        autoCorrect="off"
                                                        {...field}
                                                    />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="w-full">
                            <DialogClose asChild>
                                <div className="w-full flex justify-between">
                                    <Button type="submit">Send Otp</Button>
                                    <Button type="button" variant="secondary">
                                        Close
                                    </Button>
                                </div>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog >
        </Form>

    )
}
