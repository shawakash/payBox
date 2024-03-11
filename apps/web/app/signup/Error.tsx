"use client";
import { responseStatus } from '@paybox/common'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

export default function Error({
    children,
    status,
    msg
}: {
    children: React.ReactNode,
    status: responseStatus,
    msg: string
}){
    useEffect(() => {
        if(status === responseStatus.Error){
            toast.error(msg)
        }
    }, [msg, status])
  return (
    <>
        {children}
    </>
  )
}
