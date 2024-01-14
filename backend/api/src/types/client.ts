import { z } from "zod";
import { BaseCreateClient } from "../validations/client";

export type Client = z.infer<typeof BaseCreateClient> & { id: string }

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