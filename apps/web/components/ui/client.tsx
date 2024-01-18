"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { clientAtom } from '@paybox/recoil';
import React from 'react'
import { useRecoilValue } from 'recoil';
import { Skeleton } from './skeleton';

const Client = () => {
    const client = useRecoilValue(clientAtom);
    return (
        <>
            <Card>
                <CardHeader>
                    {!client?.email && <Skeleton className="w-[100px] h-[20px] rounded-full" />}
                    <CardTitle>{client?.firstname}</CardTitle>
                    {!client?.email && <Skeleton className="w-[100px] h-[20px] rounded-full" />}
                    <CardDescription>{client?.username}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!client?.email && <Skeleton className="w-[100px] h-[20px] rounded-full" />}
                    <p>{client?.email}</p>
                </CardContent>
                <CardFooter>
                    <p>{client?.id}</p>
                </CardFooter>
            </Card>
        </>
    )
}

export default Client;