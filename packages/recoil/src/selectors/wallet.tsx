import { BACKEND_URL } from "@paybox/common";
import { selector } from "recoil";
import { walletsAtom } from "../../dist";

export const getWalletsSelector = selector({
    key: "getWalletsSelector",
    //@ts-ignore
    get: async ({get}, jwt: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
            }).then((res) => res.json());
            return response.wallets;
            
        } catch (error) {
            console.log(error);
            return error;
        }
    },
});