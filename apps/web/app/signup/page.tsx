import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ClientSignupForm } from "@/app/signup/user-auth-signup-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { OTPForm } from "./components/otp";

export const metadata: Metadata = {
  title: "Signup | PayBox",
  description: "Authentication forms built using the components.",
};

export default function AuthenticationPage() {
  return (
    <div className="flex justify-center items-center mx-56 my-0 overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-xl">
      <div className="md:hidden">
        <Image
          src="/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <Image
          src="/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div>
      <div className="container relative hidden h-[800px] flex-col items-center justify-around md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* <Link
          href="/signin"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-2 top-2 md:right-2 md:top-2"
          )}
        >
          Signin
        </Link> */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            PayBox
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Introducing PayBox, the ultimate app for tracking and
                indexing blockchain transactions in real-time.&rdquo;
              </p>
              <footer className="text-sm">Akash Shaw</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8 w-full h-full flex justify-center space-y-6 ">
          <Tabs defaultValue="payload" className="w-[500px]">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="payload">Signup Details</TabsTrigger>
              <TabsTrigger value="valid" disabled={false}>Validations</TabsTrigger>
            </TabsList>
            <TabsContent value="payload">
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
            <TabsContent value="valid">
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
                <CardFooter className="flex flex-col space-y-4">
                  
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}
