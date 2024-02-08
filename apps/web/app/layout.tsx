import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/app/components/Client/theme-provider";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/ui/session-provider";
import RecoilRootWrapper from "@paybox/recoil/src/hooks/recoilRootWraper";
import { authOptions } from "./api/auth/[...nextauth]/util";
import RootChildLayout from "./RootChildLayout";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PayBox",
  description: "By Akash Shaw",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background w-full font-sans antialiased py-9 flex flex-col gap-y-5 items-center justify-center",
          fontSans.variable,
        )}
      >
        <link
          rel="icon"
          href="/favicon.png"
          type="image/png"
          sizes="<generated>"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session} refetchInterval={5 * 60}>
            <RecoilRootWrapper>
              <RootChildLayout children={children} />
            </RecoilRootWrapper>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
