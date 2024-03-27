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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp"
import React from "react"
import { AccountType, BACKEND_URL, OtpValid, responseStatus } from "@paybox/common"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


export function OTPForm() {

    const router = useRouter()
    const session = useSession();
    const form = useForm<z.infer<typeof OtpValid>>({
        resolver: zodResolver(OtpValid),
        defaultValues: {
            otp: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof OtpValid>) => {
        toast.promise(
            fetch(`${BACKEND_URL}/client/valid?otp=${data.otp}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    //@ts-ignore
                    "Authorization": `Bearer ${session.data?.user?.jwt}`
                },
            }).then((res) => res.json()), {
            loading: "Validating OTP",
            success: async ({ status, msg, valid, walletId, account }) => {
                // TODO: Add the walletId to the session
                if (status === responseStatus.Ok) {
                    session.update()
                    router.push("/profile")
                    return msg;
                }
                return msg;
            },
            error: ({ status, msg }) => {
                return msg;
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <InputOTP
                                    autoFocus={true}
                                    maxLength={6}
                                    render={({ slots }) => (
                                        <InputOTPGroup className="gap-2">
                                            {slots.map((slot, index) => (
                                                <React.Fragment key={index}>
                                                    <InputOTPSlot className="rounded-md border" {...slot} />
                                                    {index !== slots.length - 1 && <InputOTPSeparator />}
                                                </React.Fragment>
                                            ))}{" "}
                                        </InputOTPGroup>
                                    )}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Please enter the six digit one-time passcode sent to your phone or email by @Paybox.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
