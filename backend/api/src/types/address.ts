export enum EthNetwok {
    sepolia = "sepolia",
    mainnet = "mainnet",
    goerli = "goerli"
}

export type Filter = {
    address: string,
    topics: []
}