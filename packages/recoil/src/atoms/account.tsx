import { atom } from "recoil";

export const accountAtom = atom({
    default: null,
    key: "accountAtom",
});

export const accountsAtom = atom({
    default: [],
    key: "accountsAtom",
});
