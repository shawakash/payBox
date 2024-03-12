import { z } from "zod";

export const SolKeyParser = z.object({
    publicKey: z.string(),
    devnetSol: z.number(),
    mainnetSol: z.number(),
    testnetSol: z.number(),
})