"use client";
import { BACKEND_URL, ClientForm, hookStatus, responseStatus, useSignUpHookProps } from "@paybox/common";
import { useRecoilState, useSetRecoilState } from "recoil";
import { clientAtom } from "../atoms";

export const useSignUp =
    async (payload: ClientForm): Promise<useSignUpHookProps> => {
        const [client, setClient] = useRecoilState(clientAtom);
        try {
            const response = await fetch(`${BACKEND_URL}/client/`, {
                method: "post",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(payload),
                cache: "no-store"
            }).then(res => res.json());
            if(response.status == responseStatus.Error) {
                setClient(null);
                return {status: hookStatus.Error, msg: response.msg};
            }
            setClient({
                id: response.id,
                email: response.email,
                username: response.username,
                firstname: response.firstname,
                lastname: response.lastname,
                mobile: response.mobile,
                chain: response.chain
            });
            return response.id;
        } catch (error) {
            console.log(error);
            setClient(null);
            return {status: hookStatus.Error, msg: error as string};
        }
};
