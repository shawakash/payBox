import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import "../globals.css";

export const metadata: Metadata = {
    title: "Chat | Paybox",
    description: "Chat/message for Paybox",
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: 1,
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={GeistSans.className}>{children}</div>
    );
}