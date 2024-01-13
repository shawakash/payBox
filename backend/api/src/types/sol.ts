import { TransactionResponse } from "@solana/web3.js";

export type TransactionData = {
    type: 'transaction';
    data: TransactionResponse | null;
};

export enum SolanaNet {
    MAINNET = 'mainnet',
    DEVNET = 'devnet',
    TESTNET = 'testnet',
    LOCALNET = 'localnet',
}

export type Cluster = 'devnet' | 'testnet' | 'mainnet-beta';