import * as dotenv from "dotenv";
import { NOTIF_WORKER_PORT, KAFKA_NOTIF_URL, KAFKA_NOTIF_CLIENT_ID, VAPID_PRIVATE_KEY_DEFAULT, VAPID_PUBLIC_KEY_DEFAULT } from "@paybox/common";
dotenv.config();

export const PORT =
    process.env.NOTIF_WORKER_PORT || NOTIF_WORKER_PORT;

export const KAFKA_URL = 
    process.env.KAFKA_NOTIF_URL || KAFKA_NOTIF_URL;

export const KAFKA_ID = 
    process.env.KAFKA_NOTIF_CLIENT_ID || KAFKA_NOTIF_CLIENT_ID;

export const VAPID_PRIVATE_KEY = 
    process.env.VAPID_PRIVATE_KEY || VAPID_PRIVATE_KEY_DEFAULT;

export const VAPID_PUBLIC_KEY = 
    process.env.VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY_DEFAULT;