import { PROCESS, RedisBase } from "@paybox/backend-common";
import { ChatType } from "@paybox/common";
import { RedisClientType } from "redis";
import { REDIS_URL } from "../config";
import {ChatRedis} from "./chat";

export class Redis extends RedisBase {
    public chatCache: ChatRedis
    constructor() {
        super();
        this.client.on('connect', () => {
            console.log(`Redis ${PROCESS} server connect at port: ${REDIS_URL?.split(":").slice(-1)[0]}`);
        });

        this.client.on('error', (err) => {
            console.error(`Error connecting to Redis ${PROCESS} server:`, err);
        });



        this.client.connect();
        this.chatCache = new ChatRedis(this.client, this);
    }
}

