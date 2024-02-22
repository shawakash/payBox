import z from "zod";
import { Network } from "../types";
import { isBitcoinPrivateKey, isEthereumPrivateKey, isSolanaPrivateKey } from "../constant";

export const AccountCreateQuery = z.object({
    name: z
        .string()
        .regex(
            /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
        ),
    walletId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "should be a valid UUID.",
        ),
});

export const AccountNameQuery = z.object({
    name: z
        .string()
        .regex(
            /^[A-Za-z]+([- ]?[A-Za-z]+)*$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
        ),
    accountId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "should be a valid UUID.",
        ),
});

export const AccountGetPrivateKey = z.object({
    password: z
        .string()
        .regex(
            /^[a-z0-9_]{3,50}$/,
            "should be between 3-15 characters and can only contain numbers, letters, and underscores.",
        ),
    accountId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "should be a valid UUID.",
        ),
    network: z.nativeEnum(Network),
});

export const AccountDelete = z.object({
    accountId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "should be a valid UUID.",
        ),
});

export const AccountGetQuery = z.object({
    accountId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "should be a valid UUID.",
        ),
});

export const secretKeyType = z.union([
    z.string().refine(isSolanaPrivateKey, {
        message: "Invalid Solana address",
    }),
    z.string().refine(isEthereumPrivateKey, {
        message: "Invalid Ethereum address",
    }),
    z.string().refine(isBitcoinPrivateKey, {
        message: "Invalid Ethereum address",
    }),
]);

export const ImportAccountSecret = z.object({
    secretKey: z.string(),
    network: z.nativeEnum(Network),
    walletId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "should be a valid UUID.",
        ),
    name: z.string()
});