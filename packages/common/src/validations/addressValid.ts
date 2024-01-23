import { z } from "zod";
import { isEthereumAddress, isSolanaAddress } from "../constant";



export const AddressForm = z.object({
    eth: z
        .string()
        .refine(isEthereumAddress, {
            message: 'Invalid Ethereum address',
        }),
    sol: z
        .string()
        .refine(isSolanaAddress, {
            message: 'Invalid Solana address',
        }),
    bitcoin: z
        .string()
        .refine(isSolanaAddress, {
            message: 'Invalid Solana address',
        }),
    usdc: z
        .string()
        .refine(isSolanaAddress, {
            message: 'Invalid Solana address',
        }),
});

export const AddressFormPartial = AddressForm.partial();