import { AccountType } from "@paybox/common";
import { atom } from "recoil";

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