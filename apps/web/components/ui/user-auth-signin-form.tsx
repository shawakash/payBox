"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BACKEND_URL, ClientSigninFormValidate } from "@paybox/common"
import { headers } from "next/headers"


interface ClientSigninFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function ClientSigninForm({ className, ...props }: ClientSigninFormProps) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { data: session } = useSession(); // Use the useSession hook to get the session state
    const router = useRouter();

    React.useEffect(() => {
        // Check if the session is defined and navigate to the protected page
        if (session) {
            router.push('/protected');
        }
    }, [session, router]);

    const form = useForm<z.infer<typeof ClientSigninFormValidate>>({
        resolver: zodResolver(ClientSigninFormValidate),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof ClientSigninFormValidate>) {
        const response = await fetch(`${BACKEND_URL}/client/login`, {
            method: "post",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(values),
            cache: "no-store"
        });
        const res = await response.json();
        setIsLoading(false);
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <Form {...form}>
                <form onSubmit={(form.handleSubmit(onSubmit))}>
                    <div className="grid gap-3">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="grid gap-1">
                                    <FormLabel className="sr-only" htmlFor="email">
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            placeholder="name@email.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            autoCorrect="off"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="grid gap-1">
                                    <FormLabel className="sr-only" htmlFor="password">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            id="paswword"
                                            placeholder="@password"
                                            type="password"
                                            autoCapitalize="none"
                                            autoComplete="password"
                                            autoCorrect="off"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={isLoading} type="submit" onSubmit={() => setIsLoading(true)}>
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign In with Email
                        </Button>
                    </div>
                </form>
            </Form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-y-3">
                <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                        setIsLoading(true);
                        signIn("github").then(() => setIsLoading(false));
                    }}
                >
                    {isLoading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.gitHub className="mr-2 h-4 w-4" />
                    )}{" "}
                    GitHub
                </Button>
                <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                        signIn("google");
                    }}
                >
                    {isLoading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.google className="mr-2 h-4 w-4" />
                    )}{" "}
                    Google
                </Button>
            </div>
        </div>
    )
}