import webpush from "web-push";

import { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "./config";
import { deleteSubs, getSubs } from "./db/notif-sub";
import { dbResStatus } from "@paybox/common";

const vapidKeys = {
  publicKey: VAPID_PUBLIC_KEY,
  privateKey: VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:dev.paybox@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

/**
 * 
 * @param to 
 * @param title 
 * @param body 
 * @param href 
 * @param image 
 * @returns 
 */
export const notify = async (
  to: string,
  title: string,
  body: string,
  href?: string,
  image?: string
) => {
  const {status, subs} = await getSubs(to);

  if(status == dbResStatus.Error || !subs) {
    return;
  }

  await Promise.all(
    subs.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        expirationTime: sub.expirationTime || null,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title,
            body,
            href,
            image,
          })
        );
      } catch (e) {
        // @ts-ignore
        if (e?.statusCode === 410 && e.body?.includes("unsubscribed")) {
          await deleteSubs(sub.id);
        }
      }
    })
  );
};