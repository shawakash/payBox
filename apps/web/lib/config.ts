import { VAPID_PUBLIC_KEY_DEFAULT } from "@paybox/common";

export const VAPID_PUBLIC_KEY =
    process.env.VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY_DEFAULT;