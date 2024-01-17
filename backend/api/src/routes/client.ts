import { Router } from "express";
import { UpdateClientParser, ValidateUsername } from "../validations/client";
import { Chain, dbResStatus, responseStatus } from "../types/client";
import { checkClient, conflictClient, createClient, deleteClient, getClientByEmail, getClientById, getClientMetaData, updateMetadata } from "../db/client";
import { cache } from "..";
import { setHashPassword, setJWTCookie, validatePassword } from "../auth/util";
import { extractClientId } from "../auth/middleware";
import { Client, ClientSigninFormValidate, ClientSignupFormValidate } from "@paybox/common";

export const clientRouter = Router();

clientRouter.post("/", async (req, res) => {
    try {
        const { username, email, firstname, lastname, mobile, password } =
            ClientSignupFormValidate.parse(req.body);

        const getClient = await conflictClient(username, email, Number(mobile));
        if (getClient.client?.length) {
            return res.status(409).json({ msg: "client already exist", status: responseStatus.Error })
        }

        const hashPassword = await setHashPassword(password);
        console.log(hashPassword)
        const client = await createClient(username, email, firstname, lastname, hashPassword, Number(mobile));
        console.log(client);
        if (client.status == dbResStatus.Error) {
            return res.status(503).json({ msg: "Database Error", status: responseStatus.Error });
        }

        /**
         * Cache
         */
        await cache.cacheClient(client.id as string,
            {
                firstname,
                email,
                username,
                lastname,
                mobile,
                id: client.id as string,
                chain: client.chain as Chain,
                password: hashPassword
            });

        /**
         * Create a Jwt
         */
        let jwt: string;
        if (client.id) {
            jwt = await setJWTCookie(req, res, client.id as string);
        } else {
            return res.status(500).json({ msg: "Error creating user account", status: responseStatus.Error });
        }

        return res.status(200).json({ ...client, jwt, status: responseStatus.Ok });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: responseStatus.Error });
    }
});

/**
 * Login/signup incase of providers 
 */
clientRouter.post("/providerAuth", async (req, res) => {
    try {
        const { username, email, firstname, lastname, mobile, password } =
            ClientSignupFormValidate.parse(req.body);

        /**
         * Cache
         */
        const cachedClient = await cache.getClientFromUsername(username);
        if (cachedClient) {
            let jwt;
            if (cachedClient.id) {
                jwt = await setJWTCookie(req, res, cachedClient.id as string);
            }
            return res.status(302).json({ ...cachedClient, status: responseStatus.Ok, jwt });
        }

        const hashPassword = await setHashPassword(password);
        const client = await createClient(username, email, firstname, lastname, hashPassword, Number(mobile));
        console.log(client);
        if (client.status == dbResStatus.Error) {
            return res.status(503).json({ msg: "Database Error", status: responseStatus.Error });
        }


        /**
         * Cache
         */
        await cache.cacheClient(client?.id as string,
            {
                firstname,
                email,
                username,
                lastname,
                mobile,
                id: client?.id as string,
                chain: client?.chain as Chain,
                //@ts-ignore
                password: hashPassword || ""
            });

        /**
       * Create a Jwt
       */
        let jwt: string;
        if (client?.id) {
            jwt = await setJWTCookie(req, res, client.id as string);
        } else {
            return res.status(500).json({ msg: "Error creating user account", status: responseStatus.Error });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: responseStatus.Error });
    }
});


/**
 * Login route
 */
clientRouter.post("/login", async (req, res) => {
    try {

        const { email, password } =
            ClientSigninFormValidate.parse(req.body);

        /**
         * Query the db
         */
        const query = await getClientByEmail(email);
        if (query.status == dbResStatus.Error) {
            return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
        }
        if (!(query.client?.length)) {
            return res.status(404).json({ msg: "Not found", status: responseStatus.Error });
        }

        /**
         * Password check
         */
        const isCorrectPass = await validatePassword(password, query.client[0].password as string);
        if (!isCorrectPass) {
            return res.status(401).json({ msg: "Wrong Password", status: responseStatus.Error });
        }

        /**
         * Cache
         */
        await cache.cacheClient(
            query.client[0].id as string,
            query.client[0] as Client
        );

        /**
         * Create a Jwt
         */
        let jwt: string;
        if (query.client[0].id) {
            jwt = await setJWTCookie(req, res, query.client[0].id as string);
        } else {
            return res.status(500).json({ msg: "Error creating user account", status: responseStatus.Error });
        }

        return res.status(200).json({ ...query.client[0], jwt, status: responseStatus.Ok });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: responseStatus.Error });
    }
});

/**
 * To validate jwt and get user
 */
clientRouter.get("/me", extractClientId, async (req, res) => {
    try {
        //@ts-ignore for first-time
        const id = req.id;
        if (id) {
            const cachedUser = await cache.getClientCache(id);
            if (cachedUser) {
                //@ts-ignore
                return res.status(302).json({ ...cachedUser, status: responseStatus.Ok, jwt: req.jwt });
            }
            const query = await getClientById(id);
            if (query.status == dbResStatus.Error) {
                return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
            }
            if (!(query.user?.length)) {
                return res.status(404).json({ msg: "Not found", status: responseStatus.Error });
            }
            await cache.cacheClient(id, query.user[0] as Client);
            //@ts-ignore
            return res.status(302).json({ ...query.user[0], status: responseStatus.Ok, jwt: req.jwt });
        }
        return res.status(500).json({ status: responseStatus.Error, msg: "Jwt error" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: responseStatus.Error });
    }
});


/**
 * Get a user
 */
clientRouter.get("/:username", extractClientId, async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if (id) {

            const { username } = ValidateUsername.parse(req.params);

            /**
             * Cache
             */
            const cachedUser = await cache.getClientCache(id);
            if (cachedUser) {
                //@ts-ignore
                return res.status(302).json({ ...cachedUser, status: responseStatus.Ok, jwt: req.jwt });
            }

            const query = await getClientMetaData(username);
            if (query.status == dbResStatus.Error) {
                return res.status(503).json({ msg: "Database Error", status: responseStatus.Error });
            }

            if (!(query.client?.length)) {
                return res.status(404).json({ msg: "Not found", status: responseStatus.Error });
            }
            await cache.cacheClient(id, query.client[0] as Client);
            return res.status(302).json({ ...query.client[0], status: responseStatus.Ok });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: responseStatus.Error });
    }
});
/**
 * Update Metadata
 */
clientRouter.patch("/updateMetadata", extractClientId, async (req, res) => {
    try {
        const { firstname, lastname } = UpdateClientParser.parse(req.body);
        //@ts-ignore
        if (req.id) {
            //@ts-ignore
            const updateUser = await updateMetadata(req.id, firstname, lastname);
            if (updateUser.status == dbResStatus.Error) {
                return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
            }
            //@ts-ignore
            await cache.updateUserFields(req.id,
                {
                    firstname,
                    lastname
                });
            return res.status(200).json({ status: responseStatus.Ok, msg: "Metadata Updated" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: responseStatus.Error });
    }
});

clientRouter.delete("/delete", extractClientId, async (req, res) => {
    try {
        //@ts-ignore
        if (req.id) {
            //@ts-ignore
            const delete_user = await deleteClient(req.id);
            if (delete_user.status == dbResStatus.Error) {
                return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
            }
            //@ts-ignore
            await cache.deleteHash(req.id);
            return res.status(200).json({ status: responseStatus.Ok, msg: "User Deleted" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, status: responseStatus.Error });
    }
});
