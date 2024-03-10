"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react'
import { ClientSignupForm } from './user-auth-signup-form';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { OTPForm } from './otp';
import { ResendOtp } from './resendOtp';
import { useSession } from 'next-auth/react';
import { SignStatus } from '@paybox/common';

export function SignupTab() {
    const session = useSession();
    const [status, setStatus] = useState<SignStatus>(SignStatus.Details);

    useEffect(() => {
        //@ts-ignore
        if (session.data?.user.jwt) {
            setStatus(SignStatus.Verify)
        }
    }, [session])

    return (
        <Tabs defaultValue={SignStatus.Details} value={status} className="w-[500px]">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                <TabsTrigger value={SignStatus.Details} disabled={status === SignStatus.Verify}>Signup Details</TabsTrigger>
                <TabsTrigger value={SignStatus.Verify} disabled={status === SignStatus.Details}>Validations</TabsTrigger>
            </TabsList>
            <TabsContent value={SignStatus.Details}>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Your Account</CardTitle>
                        <CardDescription>
                            Be Sure to add Legit Details as its gonna validate you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ClientSignupForm />
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                            <Checkbox id="terms" />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Accept terms and conditions
                            </label>
                        </div>
                        <p className="px-8 text-center text-sm text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <Link
                                href="/terms"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value={SignStatus.Verify}>
                <Card className="min-h-48">
                    <CardHeader>
                        <CardTitle>One Time Passcode..</CardTitle>
                        <CardDescription>
                            Check your email or message for the OTP.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 ">
                        <OTPForm />
                    </CardContent>
                    <CardFooter className="flex flex-row ">
                        <CardDescription>Haven't Received the OTP?</CardDescription>
                        <ResendOtp />
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}