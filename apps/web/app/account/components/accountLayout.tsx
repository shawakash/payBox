"use client";

import { userData } from "@/app/chat/data";
import React, { useEffect, useState } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Archive, ArchiveX, Inbox, Send, Trash2, File, Wallet } from "lucide-react";
import { LinksProps, Sidenav } from "./sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { AccountSwitcher } from "@/app/account/components/account-switcher";
import { AccountType } from "@paybox/common";
import { useRouter } from "next/navigation";

interface AccountLayoutProps {
    defaultLayout: number[] | undefined;
    defaultCollapsed?: boolean;
    navCollapsedSize: number;
    children: React.ReactNode;
    accounts: AccountType[]
}

const sidenavLinks = [
    {
        title: "Inbox",
        label: "128",
        icon: Inbox,
        variant: "default",
        link: "/account/create",
    },
    {
        title: "Drafts",
        label: "9",
        icon: File,
        variant: "ghost",
        link: "/account/create",
    },
    {
        title: "Sent",
        label: "",
        icon: Send,
        variant: "ghost",
        link: "/account/create",
    },
    {
        title: "Junk",
        label: "23",
        icon: ArchiveX,
        variant: "ghost",
        link: "/account/create",
    },
    {
        title: "Trash",
        label: "",
        icon: Trash2,
        variant: "ghost",
        link: "/account/create",
    },
    {
        title: "Archive",
        label: "",
        icon: Archive,
        variant: "ghost",
        link: "/account/create",
    },
]

export function AccountLayout({
    defaultLayout = [100, 480],
    defaultCollapsed = false,
    navCollapsedSize,
    children,
    accounts
}: AccountLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const [selectedUser, setSelectedUser] = React.useState(userData[0]);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedAccount, setSelectedAccount] = React.useState<string>(
        accounts[0].id
    );

    const router = useRouter();

    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenWidth();

        window.addEventListener("resize", checkScreenWidth);

        return () => {
            window.removeEventListener("resize", checkScreenWidth);
        };
    }, []);

    useEffect(() => {
        router.push(`/account?id=${selectedAccount}`);
    }, [selectedAccount]);

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                        sizes
                    )}`
                }}
                className="h-full max-h-[800px] items-stretch"
            ></ResizablePanelGroup>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                        sizes
                    )}`;
                }}
                className="min-h-screen w-screen rounded-lg border"
            >
                <ResizablePanel
                    defaultSize={defaultLayout[0]}
                    collapsedSize={navCollapsedSize}
                    collapsible={true}
                    minSize={isMobile ? 0 : 14}
                    maxSize={isMobile ? 14 : 20}
                    onCollapse={() => {
                        setIsCollapsed(true);
                        document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                            true
                        )}`;
                    }}
                    onExpand={() => {
                        setIsCollapsed(false);
                        document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                            false
                        )}`;
                    }}
                    className={cn(
                        isCollapsed && " min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out"
                    )}
                >
                    <div
                        className={cn(
                            "flex h-[52px] items-center justify-center",
                            isCollapsed ? "h-[52px]" : "px-4"
                        )}
                    >
                        <AccountSwitcher
                            isCollapsed={isCollapsed}
                            accounts={accounts as { id: string, name: string }[]}
                            selectedAccount={selectedAccount}
                            setSelectedAccount={setSelectedAccount}
                        />
                    </div>
                    <Separator />
                    <Sidenav
                        isCollapsed={isCollapsed}
                        links={sidenavLinks as LinksProps[]}
                    />
                    <Separator />
                    <Sidenav
                        isCollapsed={isCollapsed}
                        links={sidenavLinks as LinksProps[]}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    {children}
                </ResizablePanel>
            </ResizablePanelGroup>
        </TooltipProvider>
    );
}