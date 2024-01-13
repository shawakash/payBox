import { Router } from "express";
import { BaseCreateClient } from "../validations/client";
import { responseStatus } from "../types/client";

const clientRouter = Router();

clientRouter.post("/", async (req, res) => {
    try {
        const { username, email, firstname, lastname, mobile, address, chain } =
            BaseCreateClient.parse(req.body);

        return res.status(200).json({ status: responseStatus.Ok });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});