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
    amount: z
        .string()
        .refine(value => {
            const numericValue = parseFloat(value);
            return !isNaN(numericValue);
        }, {
            message: 'Amount must be a valid number',
            path: ['amount'],
        })
        .transform(value => parseFloat(value)),
});

