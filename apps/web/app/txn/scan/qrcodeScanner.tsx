"use client";
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const QRScanner = () => {
    const [result, setResult] = useState<string | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("qr-reader", {
            qrbox: {
                width: 250,
                height: 250
            },
            fps: 10,
        }, true);
    
        const onSuccess = (decodedText: string) => {
            console.log(`QR code decoded: ${decodedText}`);
            setResult(decodedText);
        };
        const onError = (errorMessage: string) => {
            console.error(`QR code error: ${errorMessage}`);
        };
    
        scanner.render(onSuccess, onError);
    }, []);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Scan the Qrcode</CardTitle>
                <CardDescription>Qrcode scanner for transaction</CardDescription>
            </CardHeader>
            <CardContent>
                {result ?
                    <p>Result: {result}</p> :
                    <div id="qr-reader"></div>
                }
            </CardContent>
            <CardFooter>
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    Paybox
                </div>
            </CardFooter>
        </Card>
    );
}

export default QRScanner;
