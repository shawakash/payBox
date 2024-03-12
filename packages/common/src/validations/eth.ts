import { z } from "zod";

export const EthKeyParser = z.object({
    publicKey: z.string(),
    goerliEth: z.number(),
    kovanEth: z.number(),
    mainnetEth: z.number(),
    rinkebyEth: z.number(),
    ropstenEth: z.number(),
    sepoliaEth: z.number(),
});