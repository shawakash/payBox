import { TxnSolSendQuery, responseStatus } from "@paybox/common";
import { Router } from "express";
import SolTxnLogs from "../sockets/sol";

export const txnRouter = Router();

txnRouter.post("/send", async (req, res) => {
    try {
        const {senderKey, amount, receiverKey} = TxnSolSendQuery.parse(req.query);
        const solTxn = await new SolTxnLogs("devnet", receiverKey).acceptTxn({senderKey, amount, receiverKey});
        if(!solTxn) {
            return res.status(400).json({ status: responseStatus.Error, msg: "Transaction failed" })
        }
        /**
         * Do a db call
         */
        return res.status(200).json({ status: responseStatus.Ok, signature: solTxn })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: responseStatus.Error, msg: "Internal Server Error" });
    }
});