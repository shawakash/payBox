
export enum dbResStatus {
    Error = "error",
    Ok = "ok",
}

export enum responseStatus {
    Error = "error",
    Ok = "ok",
}

export type getClientId = {
    id?: unknown
}

export type Chain = {
    eth: string,
    sol: string,
    bitcoin: string,
    usdc: string,
}