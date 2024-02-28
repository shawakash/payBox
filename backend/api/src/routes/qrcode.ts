import { Router } from "express";
import { createReadStream } from "fs";
import { AccountType, Address, QrcodeQuery, responseStatus } from "@paybox/common";
import { generateQRCode } from "../auth/util";
import { checkValidation, hasAddress, isValidated } from "../auth/middleware";
import { cache } from "..";

export const qrcodeRouter = Router();

qrcodeRouter.get("/get", hasAddress, async (req, res) => {
  try {
    //@ts-ignore
    const address = req.address;
    if (address) {
      const isGenerated = await generateQRCode(
        address as Partial<Address>,
        address.id,
      );
      if (!isGenerated) {
        return res.status(500).json({
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


qrcodeRouter.get('/', checkValidation, async (req, res) => {
  try {
    const { accountId } = QrcodeQuery.parse(req.query);

    //cache
    const acocunt = await cache.account.getAccount<AccountType>(accountId);
    if (!acocunt) {
      return res
        .status(400)
        .json({
          status: responseStatus.Error,
          msg: "Account not found"
        });
      }
    const code = await generateQRCode(
      {
        sol: acocunt.sol.publicKey,
        eth: acocunt.eth.publicKey,
        bitcoin: acocunt.bitcoin?.publicKey,
      },
      acocunt.id,
    );
    if (!code) {
      return res.status(500).json({
        status: responseStatus.Error,
        msg: "Error in generating qr code",
      });
    }
    res.setHeader("Content-Type", "image/png");
    const stream = createReadStream(code);

    stream.pipe(res);

  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Internal Server Error" });
  }
});