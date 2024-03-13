"use client"
import React, { useState } from 'react'

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectAccountProps {
    accounts: {
        id: string,
        name: string
    }[],
    isCollapsed: boolean,
    selectedAccount: string,
    setSelectedAccount: (accountId: string) => void
}

export function SelectAcocunt({accounts, isCollapsed, selectedAccount, setSelectedAccount}: SelectAccountProps) {

    return (
        <>
            <Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger
                    className={cn(
                        "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
                        isCollapsed &&
                        "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
                    )}
                    aria-label="Select account"
                >
                    <SelectValue placeholder="Select an account">
                        <span className={cn("ml-2", isCollapsed && "hidden")}>
                            {
                                accounts.find((account) => account.id === selectedAccount)
                                    ?.name
                            }
                        </span>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                                {account.name}
                                {/* <div className="">{account.id.slice(0, 5)}</div> */}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </>
    )
}
