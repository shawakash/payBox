import { BACKEND_URL } from "@paybox/common";
import { selector } from "recoil";

export const getAccount = selector({
    key: "getAccount",
    //@ts-ignore
    get: ({accountId, jwt}) => async () => {
        const response = await fetch(`${BACKEND_URL}/account?accountId=${accountId}`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
        }).then(res => res.json());
        return response.account;
    },
});