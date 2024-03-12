"use client"
import { atom } from "recoil";

export const walletAtom = atom({
    default: null,
    key: "walletAtom",
});

export const walletsAtom = atom({
    default: [],
    key: "walletsAtom",
});