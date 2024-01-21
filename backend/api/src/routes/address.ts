import { Address, AddressForm, responseStatus } from "@paybox/common";
import { Router } from "express";
import { checkAddress } from "../auth/middleware";
import { conflictAddress, createAddress, getAddressByClientId } from "../db/address";
import { dbResStatus } from "../types/client";
import { cache } from "..";

export const addressRouter = Router();

/**
 * Add the address for different chains
 */
addressRouter.post("/", checkAddress, async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if (id) {
            const { eth, sol, bitcoin, usdc } = AddressForm.parse(req.body);

            const isInDb = await conflictAddress(eth, sol, id, bitcoin, usdc);
            if (isInDb.chain?.length) {
                return res.status(409).json({ msg: "address already exist", status: responseStatus.Error })
            }

            const mutateAddress = await createAddress(eth, sol, id, bitcoin, usdc);
            if (mutateAddress.status == dbResStatus.Error) {
                return res.status(503).json({ msg: "Database Error", status: responseStatus.Error });
            }

            /**
             * Cache
             */

            await cache.cacheAddress(mutateAddress.id as string, {
                eth,
                sol,
                bitcoin,
                usdc,
                id: mutateAddress.id as string,
                clientId: id
            });
            await cache.updateClientAddress(id, {
                eth,
                bitcoin,
                sol,
                usdc
            });

            return res.status(200).json({ id: mutateAddress.id, status: responseStatus.Ok });

        }
        //@ts-ignore
        return res.status(302).json({ ...query.client[0], status: responseStatus.Ok, jwt: req.jwt });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: responseStatus.Error, msg: "Internal error", error: error });
    }
});

//To get address
addressRouter.get("/", async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if(id) {
            const isCached = await cache.getAddressFromKey(id);
            if(isCached) {
                return res.status(200).json({ status: responseStatus.Ok,  })
            }

            const query = await getAddressByClientId(id);
            if(query.status == dbResStatus.Error) {
                return res.status(500).json({ status: responseStatus.Error, msg: "Database Error" });
            }
            if (!(query.address?.length)) {
                return res.status(404).json({ msg: "Not found", status: responseStatus.Error });
            }
            await cache.cacheAddress(id, query.address[0] as Address & {id: string, clientId: string});

            return res.status(302).json({ ...query.address[0], status: responseStatus.Ok });
        }
        return res.status(500).json({ status: responseStatus.Error, msg: "No id provided." })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: responseStatus.Error, msg: "Internal error", error: error });
    }
});