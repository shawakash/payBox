import * as dotenv from "dotenv";
import { NOTIF_WORKER_PORT } from "@paybox/common";
dotenv.config();

export const PORT =
    process.env.NOTIF_WORKER_PORT || NOTIF_WORKER_PORT;