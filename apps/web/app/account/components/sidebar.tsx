"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import React, { use } from "react"
import { usePathname, useSearchParams, useParams } from 'next/navigation'


export interface LinksProps {
    id: string
    title: string
    label?: string
    icon: LucideIcon
    link: string
    variant: "default" | "ghost"
}

interface NavProps {
    isCollapsed: boolean
    links: LinksProps[]
    selectedTab: string
    setSelectedTab: (tab: string) => void
}

export function Sidenav({ links, isCollapsed, selectedTab, setSelectedTab }: NavProps) {
    return (
        <div
            data-collapsed={isCollapsed}
            className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
        >
            <nav className="grid gap-1.5 px-4 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                {links.map((link, index) =>
                    isCollapsed ? (
                        <Tooltip key={index} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={`${link.link}`}
                                    onClick={() => setSelectedTab(link.id)}
                                    className={cn(
                                        buttonVariants({ variant: link.variant, size: "icon" }),
                                        "h-10 w-10",
                                        link.id === selectedTab &&
                                        "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white "
                                    )}
                                >
                                    <link.icon className="h-5 w-5" />
                                    <span className="sr-only">{link.title}</span>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="flex items-center gap-4">
                                {link.title}
                                {link.label && (
                                    <span className="ml-auto text-muted-foreground">
                                        {link.label}
                                    </span>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Link
                            key={index}
                            href={link.link}
                            onClick={() => setSelectedTab(link.id)}
                            className={cn(
                                buttonVariants({ variant: link.variant, size: "sm" }),
                                link.id === selectedTab &&
                                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                                "justify-start",
                                "h-10 flex gap-x-2"
                            )}
                        >
                            <link.icon className="mr-2 h-4 w-4" />
                            <div
                                className={cn("font-semibold leading-none tracking-tight text-[18px]")}
                            >
                                {link.title}
                            </div>
                            {link.label && (
                                <span
                                    className={cn(
                                        "ml-auto",
                                        link.variant === "default" &&
                                        "text-background dark:text-white"
                                    )}
                                >
                                    {link.label}
                                </span>
                            )}
                        </Link>
                    )
                )}
            </nav>
        </div>
    )
}