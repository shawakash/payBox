import { Router } from "express";
import {createReadStream} from "fs";
import { Address, responseStatus } from "@paybox/common";
import { getAddressByClientId } from "../db/address";
import { dbResStatus } from "../types/client";
import { generateQRCode, generateUniqueImageName } from "../auth/util";

export const qrcodeRouter = Router();

qrcodeRouter.post("/address", async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if (id) {
            const addressQuery = await getAddressByClientId(id);
            if (addressQuery.status == dbResStatus.Error) {
                return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
            }
            if (!addressQuery.address) {
                return res.status(400).json({ status: responseStatus.Error, msg: "Address is not added" });
            }
            const path = generateUniqueImageName(id);
            const isGenerated = await generateQRCode(
                addressQuery?.address[0] as Partial<Address> & { id: string },
                path
            );
            if (!isGenerated) {
                return res.status(500).json({ status: responseStatus.Error, msg: "Error in generating qr code" });
            }
            res.setHeader('Content-Type', 'image/png');
            createReadStream(path).pipe(res);
            return res.status(200).json({ status: responseStatus.Ok, path });
        }
        return res.status(401).json({ status: responseStatus.Error, msg: "Uuauthorized to do this" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: responseStatus.Error, msg: "Internal Server Error" });
    }
});