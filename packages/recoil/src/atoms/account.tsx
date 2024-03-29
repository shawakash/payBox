import { AccountType, BACKEND_URL, responseStatus } from "@paybox/common";
import { atom, selector } from "recoil";
import { clientAtom } from "./client";

export const accountAtom = atom({
    default: null,
    key: "accountAtom",
});

export const accountsAtom = atom<AccountType[]>({
    default: [],
    key: "accountsAtom",
});

//TODO: set this to the default account number by
export const defaultAccountNumberAtom = atom<number>({
    default: 1,
    key: "defaultAccountNumberAtom",
});

export const getAccountNumber = selector<number>({
    key: 'getAccountNumber',
    get: async ({ get }) => {
        const jwt = get(clientAtom)?.jwt;
        try {
            const {status, putUrl, number}: {status: responseStatus, putUrl: string, number: number} = await fetch(`${BACKEND_URL}/account/defaultMetadata`, {
                method: "get",
                headers: {
                    "Content-type": "application/json",
                    //@ts-ignore
                    "Authorization": `Bearer ${jwt}`
                }
            }).then(res => res.json());
            if(status == responseStatus.Error) {
                return 1;
            }
            return number + 1;
        } catch (error) {
            console.error(error)
            return 1;
        }
    },
});

export const accountPrivateKeysAtom = atom<{
    network: "Solana" | "Ethereum",
    privateKey: string,
}[]>({
    default: [],
    key: "accountPrivateKeysAtom",
});