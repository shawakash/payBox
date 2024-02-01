import { z } from "zod";
import { isEthereumAddress, isSolanaAddress } from "../constant";
import { Network } from "../types";

const AddressType = z.union([
    z.string().refine(isSolanaAddress, {
        message: 'Invalid Solana address',
    }),
    z.string().refine(isEthereumAddress, {
        message: 'Invalid Ethereum address',
    }),
]);

export const TxnSendQuery = z.object({
    from: AddressType,
    to: AddressType,
    amount: z
        .number()
        .refine(value => {
            const numericValue = parseFloat(value as unknown as string);
            return !isNaN(numericValue);
        }, {
            message: 'Amount must be a valid number',
            path: ['amount'],
        })
        .transform(value => parseFloat(value as unknown as string)),
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

export const TxnQeuryByHash = z.object({
    network: z.nativeEnum(Network),
    sign: z.string()
});

export const TxnSchema = z.object({
    clientId: z.string(),
    blockTime: z.number(),
    amount: z.number(),
    fee: z.number(),
    from: z.string(),
    to: z.string(),
    postBalances: z.array(z.number()),
    preBalances: z.array(z.number()),
    recentBlockhash: z.string(),
    signature: z.array(z.string()),
    network: z.nativeEnum(Network),
    slot: z.number(),
    id: z.string(),
    date: z.string().optional()
});