import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import { ThemeProvider } from "@/app/components/Client/theme-provider";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/ui/session-provider";
import RecoilRootWrapper from "@paybox/recoil/src/hooks/recoilRootWraper";
import { authOptions } from "./api/auth/[...nextauth]/util";
import RootChildLayout from "./RootChildLayout";
import NotifWrapper from "./NotifWrapper";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
  adjustFontFallback: false
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
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
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
            <NotifWrapper>
              <RecoilRootWrapper>
                <RootChildLayout children={children} />
              </RecoilRootWrapper>
            </NotifWrapper>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
