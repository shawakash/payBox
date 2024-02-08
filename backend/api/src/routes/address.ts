import {
  Address,
  AddressForm,
  AddressFormPartial,
  responseStatus,
} from "@paybox/common";
import { Router } from "express";
import { checkAddress } from "../auth/middleware";
import {
  conflictAddress,
  createAddress,
  getAddressByClientId,
  updateAddress,
} from "../db/address";
import { dbResStatus } from "../types/client";
import { cache } from "../index";

export const addressRouter = Router();

/**
 * Add the address for different chains
 */
addressRouter.post("/", checkAddress, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { eth, sol, bitcoin, usdc } = AddressFormPartial.parse(req.body);
      if (eth != undefined && sol != undefined) {
        const isInDb = await conflictAddress(id, eth, sol, bitcoin, usdc);
        if (isInDb.status == dbResStatus.Error) {
          return res
            .status(503)
            .json({ msg: "Database Error", status: responseStatus.Error });
        }
        if (isInDb.address?.length) {
          return res
            .status(409)
            .json({
              msg: "address already exist",
              status: responseStatus.Error,
            });
        }
        const mutateAddress = await createAddress(eth, sol, id, bitcoin, usdc);
        if (mutateAddress.status == dbResStatus.Error) {
          return res
            .status(503)
            .json({ msg: "Database Error", status: responseStatus.Error });
        }

        /**
         * Cache
         */

        await cache.cacheAddress(mutateAddress.id as string, {
          eth,
          sol,
          bitcoin: bitcoin || "",
          usdc: usdc || "",
          id: mutateAddress.id as string,
          clientId: id,
        });
        return res
          .status(200)
          .json({ id: mutateAddress.id, status: responseStatus.Ok });
      }
      return res
        .status(400)
        .json({
          status: responseStatus.Error,
          msg: "Atleast eth and sol are required 😊",
        });
    }
    //@ts-ignore
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Jwt error" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        status: responseStatus.Error,
        msg: "Internal error",
        error: error,
      });
  }
});

//To get address
addressRouter.get("/", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const isCached = await cache.getAddressFromKey(id);
      if (isCached) {
        return res.status(200).json({ status: responseStatus.Ok, ...isCached });
      }

      const query = await getAddressByClientId(id);
      if (query.status == dbResStatus.Error) {
        return res
          .status(500)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      if (!query.address?.length) {
        return res
          .status(404)
          .json({ msg: "Not found", status: responseStatus.Error });
      }
      await cache.cacheAddress(
        id,
        query.address[0] as unknown as Partial<Address> & {
          id: string;
          clientId: string;
        },
      );

      return res
        .status(302)
        .json({ ...query.address[0], status: responseStatus.Ok });
    }
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "No id provided." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        status: responseStatus.Error,
        msg: "Internal error",
        error: error,
      });
  }
});

addressRouter.patch("/update", checkAddress, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { eth, sol, bitcoin, usdc } = AddressFormPartial.parse(req.body);

      const isInDb = await conflictAddress(id, eth, sol, bitcoin, usdc);
      if (isInDb.address?.length) {
        return res
          .status(409)
          .json({ msg: "address already exist", status: responseStatus.Error });
      }

      const mutateAddress = await updateAddress(id, eth, sol, bitcoin, usdc);
      if (mutateAddress.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }

      /**
       * Cache
       */

      await cache.patchAddress(mutateAddress.id as string, {
        eth,
        sol,
        bitcoin,
        usdc,
      });

      return res
        .status(200)
        .json({ id: mutateAddress.id, status: responseStatus.Ok });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        status: responseStatus.Error,
        msg: "Internal error",
        error: error,
      });
  }
});
