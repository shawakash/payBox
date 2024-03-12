import { BACKEND_URL } from "@paybox/common";
import { selector } from "recoil";
import { walletsAtom } from "../../dist";

export const getWallets = selector({
    key: "getWallets",
    get: (jwt) => async ({ }) => {
        const response = await fetch(`${BACKEND_URL}/wallets`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
        }).then(res => res.json());
        return response.wallets;
    },
    // set: ({ set }, newValue) => {
    //     set(walletsAtom, newValue);
    // }
});