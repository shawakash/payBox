import { Router } from "express";
import { createReadStream } from "fs";
import { Address, responseStatus } from "@paybox/common";
import { generateQRCode } from "../auth/util";
import { hasAddress } from "../auth/middleware";

export const qrcodeRouter = Router();

qrcodeRouter.get("/get", hasAddress, async (req, res) => {
  try {
    //@ts-ignore
    const address = req.address;
    if (address) {
      const isGenerated = await generateQRCode(
        address as Partial<Address> & { id: string },
        address.id,
      );
      if (!isGenerated) {
        return res
          .status(500)
          .json({
            status: responseStatus.Error,
            msg: "Error in generating qr code",
          });
      }
      res.setHeader("Content-Type", "image/png");
      const stream = createReadStream(isGenerated);

      stream.pipe(res);
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Internal Server Error" });
  }
});
