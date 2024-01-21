
export enum dbResStatus {
    Error = "error",
    Ok = "ok",
}


export type getClientId = {
    id?: unknown
}

export type Address = {
    eth: string,
    sol: string,
    bitcoin: string,
    usdc: string,
    id: string
}