export enum EthNetwok {
  sepolia = "sepolia",
  mainnet = "mainnet",
  goerli = "goerli",
}

export type Filter = {
  address: string;
  topics: [];
};


export type WalletKeys = {
  privateKey: string;
  publicKey: string;
};