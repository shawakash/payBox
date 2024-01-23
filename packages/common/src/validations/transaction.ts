import { z } from "zod";
import { isSolanaAddress } from "../constant";

export const TxnSolSendQuery = z.object({
    senderKey: z
        .string()
        .refine(isSolanaAddress, {
            message: 'Invalid Ethereum address',
        }),
    receiverKey: z
        .string()
        .refine(isSolanaAddress, {
            message: 'Invalid Ethereum address',
        }),
    amount: z.number()
});
