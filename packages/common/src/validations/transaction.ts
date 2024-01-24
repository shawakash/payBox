import { z } from "zod";
import { isSolanaAddress } from "../constant";
import { Network } from "../types";

export const TxnSendQuery = z.object({
    from: z
        .string()
        .refine(isSolanaAddress, {
            message: 'Invalid Ethereum address',
        }),
    to: z
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
    network: z.nativeEnum(Network)
});

export const TxnsQeury = z.object({
    networks: z.union([z.nativeEnum(Network), z.array(z.nativeEnum(Network))]), // ["sol", "eth"] || "sol"
    count: z
        .string()
        .refine(value => {
            const numericValue = parseInt(value);
            return !isNaN(numericValue);
        }, {
            message: 'Count must be a valid number, representing the number of txns required.',
            path: ['count'],
        })
        .transform(value => parseInt(value)),
});