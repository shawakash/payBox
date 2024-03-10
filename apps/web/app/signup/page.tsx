import { Metadata } from "next";
import Image from "next/image";

import { SignStatus } from "@paybox/common";
import { SignupTab } from "./components/signup-tab";


export const metadata: Metadata = {
  title: "Signup | PayBox",
  description: "Authentication forms built using the components.",
};

export default async function AuthenticationPage({searchParams}: {searchParams: {status: SignStatus}}) {
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
      <div className="container relative hidden h-[780px] flex-col items-center justify-around md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
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
              <footer className="text-sm font-bold">Shaws</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8 w-full h-full flex justify-center space-y-6 ">
          <SignupTab />
        </div>
      </div>
    </div>
  );
}
