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
import { toast } from "@/components/ui/use-toast"
import { BACKEND_URL, ResendOtpValid } from "@paybox/common";


export function ResendOtp() {

    // USE THE ATOM TO GET THE USER'S EMAIL, PHONE NUMBER and JWT
    // CALL THE API TO RESEND THE OTP

    const form = useForm<z.infer<typeof ResendOtpValid>>({
        resolver: zodResolver(ResendOtpValid),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof ResendOtpValid>) => {
        toast({
            title: "Resending Otp..",
            description: (
                <h1>Resending Otp to {data.email}, {data.mobile}</h1>
            ),
        })
        const { status, msg }: {status: string, msg: string} =
            await fetch(`${BACKEND_URL}/client/resend?mobile=${data.mobile}&email=${data.email}&name=Akash`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json());
        // handle the response
        toast({
            title: `Resending Otp..`,
            description: (
                <h1>{status}: {msg}</h1>
            ),
        })
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="link">Resend Otp</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Resend Otp</DialogTitle>
                            <DialogDescription>
                                Re-check your email or phone for the OTP to send.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col space-y-3 pt-2">
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
                                    <Button
                                        type="submit"
                                    // onSubmit={() => setIsLoading(true)}
                                    >
                                        {/* {isLoading && (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                )} */}
                                        Send Otp
                                    </Button>
                                    <Button type="button" variant="secondary">
                                        Close
                                    </Button>
                                </div>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog >
            </form>
        </Form>

    )
}
