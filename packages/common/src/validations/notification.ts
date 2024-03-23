import { z } from "zod";

export const SubscibeValid = z.object({
    endpoint: z.string(),
    expirationTime: z.string().nullable(),
    p256dh: z.string(),
    auth: z.string(),
});