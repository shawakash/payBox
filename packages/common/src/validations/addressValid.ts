import { z } from "zod";

const isEthereumAddress = (value: string): boolean => /^0x[0-9a-fA-F]{40}$/.test(value);
const isSolanaAddress = (value: string): boolean => /^[a-zA-Z0-9]{44}$/.test(value);

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