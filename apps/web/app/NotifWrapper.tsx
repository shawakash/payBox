"use client";

import { VAPID_PUBLIC_KEY } from "@/lib/config";
import { BACKEND_URL } from "@paybox/common";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import * as base58 from "bs58";

export default function NotifWrapper({
    children,
}: {
    children: React.ReactNode;
}) {

    const session = useSession();

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            if (navigator.serviceWorker.controller) {
              console.log('Service worker is already registered.');
            } else {
              navigator.serviceWorker.register('/service-worker.js')
                .then(function (registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
                  if (registration.active) {
                    return registration.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: VAPID_PUBLIC_KEY
                    })
                      .then(async (subscription) => {
                        console.log('User is subscribed:', subscription);
          
                        if (!session.data?.user?.email) {
                          console.log('User is not logged in.')
                          return;
                        }
          
                        await fetch(`${BACKEND_URL}/notif/subscribe`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            //@ts-ignore
                            'Authorization': `Bearer ${session.data.user.jwt}`
                          },
                          body: JSON.stringify({
                            auth: base58.encode(new Uint8Array(subscription.getKey('auth') || new ArrayBuffer(0))),
                            endpoint: subscription.endpoint,
                            expirationTime: subscription.expirationTime,
                            p256dh: base58.encode(new Uint8Array(subscription.getKey('p256dh') || new ArrayBuffer(0))),
                          })
                        });
                      });
                  } else {
                    console.log('Service worker is not active yet.');
                  }
                })
                .catch(function (err) {
                  console.log('Service Worker and Push is not supported: ', err);
                });
            }
          } else {
            console.log('Service workers are not supported in this browser.');
          }
    }, [session.data?.user?.email])
    return (
        <>
            {children}
        </>
    );
}
