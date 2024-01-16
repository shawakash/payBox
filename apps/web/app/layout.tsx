import './globals.css'
import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import { ThemeProvider } from "@/app/components/Client/theme-provider"
import { ModeToggle } from './components/Client/ModeToggle'
import { cn } from "@/lib/utils";
import { getServerSession } from 'next-auth';
import SessionProvider from "@/components/ui/session-provider";
import Link from 'next/link'
import { Nav } from '@/components/ui/nav'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'PayBox',
  description: 'By Akash Shaw',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased py-9 flex flex-col gap-y-5 items-center justify-center",
        fontSans.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session} refetchInterval={5 * 60}>
            <Nav />
            <main className="flex min-h-screen py-5 flex-col items-center ">
              {children}
            </main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
