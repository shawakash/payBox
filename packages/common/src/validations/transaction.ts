import { z } from "zod";
import {
  BitcoinCluster,
  EthCluster,
  SolCluster,
  USDCCluster,
  isEthereumPublicKey,
  isEthereumPrivateKey,
  isSolanaAddress,
} from "../constant";
import { Network } from "../types";
import { Cluster } from "@solana/web3.js";

const AddressType = z.union([
  z.string().refine(isEthereumPrivateKey, {
    message: "Invalid Ethereum address",
  }),
  z.string().refine(isSolanaAddress, {
    message: "Invalid Solana address",
  }),
  z.string().refine(isEthereumPublicKey, {
    message: "Invalid Ethereum address",
  }),
]);

export const TxnSendQuery = z.object({
  from: AddressType,
  to: AddressType,
  amount: z
    .string()
    .refine(
      (value) => {
        const numericValue = parseFloat(value as unknown as string);
        return !isNaN(numericValue);
      },
      {
        message: "Amount must be a valid number",
        path: ["amount"],
      },
    )
    .transform((value) => parseFloat(value as unknown as string)),
  network: z.nativeEnum(Network),
  cluster: z
    .union([
      z.nativeEnum(SolCluster),
      z.nativeEnum(EthCluster),
      z.nativeEnum(BitcoinCluster),
      z.nativeEnum(USDCCluster),
  ]),
});

export const TxnsQeury = z.object({
  networks: z.union([z.nativeEnum(Network), z.array(z.nativeEnum(Network))]), // ["sol", "eth"] || "sol"
  count: z
    .string()
    .refine(
      (value) => {
        const numericValue = parseInt(value);
        return !isNaN(numericValue);
      },
      {
        message:
          "Count must be a valid number, representing the number of txns required.",
        path: ["count"],
      },
    )
    .transform((value) => parseInt(value)),
});

export const TxnQeuryByHash = z.object({
  network: z.nativeEnum(Network),
  sign: z.string(),
});

export const TxnSchema = z.object({
  clientId: z.string(),
  blockTime: z.number(),
  amount: z.number(),
  fee: z.number(),
  from: z.string(),
  to: z.string(),
  postBalances: z.array(z.number()).nullable(),
  preBalances: z.array(z.number()).nullable(),
  recentBlockhash: z.string(),
  signature: z.array(z.string()),
  network: z.nativeEnum(Network),
  slot: z.number().nullable(),
  id: z.string(),
  date: z.string().optional(),
});
