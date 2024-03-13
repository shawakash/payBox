"use client";
import { AccountType } from '@paybox/common';
import React, { useState } from 'react'
import { SelectAcocunt } from './selectAccount';

interface AccountNavProps {
    accounts: AccountType[]
}

export function AccountNav({ accounts }: AccountNavProps) {
    const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0].id)
    return (
        <>
            <SelectAcocunt
                accounts={accounts.map(acc => {
                    return {
                        id: acc.id,
                        name: acc.name
                    }
                })}
                isCollapsed={false}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
            />
        </>
    )
}
