"use client";

import { userData } from "@/app/chat/data";
import React, { useEffect, useState } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

import { LinksProps, Sidenav } from "@/app/account/components/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { AccountSwitcher } from "@/app/account/components/account-switcher";
import { AccountType } from "@paybox/common";
import { usePathname, useRouter } from "next/navigation";
import { commonNavLinks, getNavLinks } from "./navLinks";

interface AccountLayoutProps {
    defaultLayout: number[] | undefined;
    defaultCollapsed?: boolean;
    navCollapsedSize: number;
    children: React.ReactNode;
    accounts: AccountType[]
}



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

    const path = usePathname()
    const router = useRouter();
    const [selectedTab, setSelectedTab] = React.useState<string>(path.split('/')[path.split('/').length - 1]);

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
        setSelectedTab(path.split("/")[3] || "dashboard")
        router.push(`/account/${selectedAccount}/${path.split("/")[3] || ""}`)
    }, [selectedAccount])

    useEffect(() => {
        if (path.split("/").length === 2) {
            setSelectedTab(path.split("/")[2] || "");
            router.push(path)
        }
        if (path.split("/").length === 3) {
            setSelectedTab(path.split("/")[3] || "dashboard");
            router.push(path)
        }
    }, [path]);

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
                    minSize={isMobile ? 0 : 18}
                    maxSize={isMobile ? 18 : 25}
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
                        links={getNavLinks(selectedAccount) as LinksProps[]}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    />
                    <Separator />
                    <Sidenav
                        isCollapsed={isCollapsed}
                        links={commonNavLinks as LinksProps[]}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
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