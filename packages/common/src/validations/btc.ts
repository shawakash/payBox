import { z } from "zod";

export const BtcParser = z.object({
    publicKey: z.string(),
    mainnetBtc: z.number(),
    regtestBtc: z.number(),
    textnetBtc: z.number(),
}).optional()