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
                {client == null ?
                    <Skeleton className="min-w-[8rem]" /> :
                    <CardTitle>{client?.firstname} {client?.lastname}</CardTitle>
                }
                    <CardDescription>{client?.username}</CardDescription>
                </CardHeader>
                <CardContent>
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