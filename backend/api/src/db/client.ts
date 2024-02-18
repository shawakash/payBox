import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus, getClientId } from "../types/client";
import { HASURA_ADMIN_SERCRET, WalletKeys } from "@paybox/common";
import { Wallet, ethers } from "ethers";
import { Keypair } from "@solana/web3.js";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
    "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
  },
});

/**
 * 
 * @param username 
 * @param email 
 * @param firstname 
 * @param lastname 
 * @param hashPassword 
 * @param mobile 
 * @param seed 
 * @param solKeys 
 * @param ethKeys 
 * @returns 
 */
export const createClient = async (
  username: string,
  email: string,
  firstname: string | undefined,
  lastname: string | undefined,
  hashPassword: string,
  mobile: number | null,
  seed: string,
  solKeys: WalletKeys,
  ethKeys: WalletKeys,
): Promise<{
  id?: unknown;
  address?: unknown;
  walletId?: unknown;
  accountId?: unknown;
  status: dbResStatus;
}> => {
  const clientResponse = await chain("mutation")(
    {
      insert_client_one: [
        {
          object: {
            firstname,
            email,
            username,
            lastname,
            mobile: mobile || null,
            password: hashPassword,
          },
        },
        {
          id: true,
          address: {
            bitcoin: true,
            eth: true,
            sol: true,
            usdc: true,
            id: true,
          },
        },
      ],
    },
    { operationName: "createClient" },
  );
  if (clientResponse.insert_client_one?.id) {

    const createWallet = await chain("mutation")({
      insert_wallet_one: [
        {
          object: {
            clientId: clientResponse.insert_client_one.id,
            secretPhase: seed,
            accounts: {
              data: [
                {
                  clientId: clientResponse.insert_client_one.id,
                  sol: {
                    data: {
                      publicKey: solKeys.publicKey,
                      privateKey: solKeys.privateKey,
                    }
                  },
                  eth: {
                    data: {
                      publicKey: ethKeys.publicKey,
                      privateKey: ethKeys.privateKey,
                    }
                  },
                }
              ]
            }
          },
        },
        {
          id: true,
          accounts: [{
            limit: 1,

          }, {
            id: true,

          }]
        },
      ],
    }, { operationName: "createWallet" });

    if (createWallet.insert_wallet_one?.id) {

      return {
        ...clientResponse.insert_client_one,
        walletId: createWallet.insert_wallet_one.id,
        accountId: createWallet.insert_wallet_one.accounts[0].id,
        status: dbResStatus.Ok
      };
    }
    return { ...clientResponse.insert_client_one, status: dbResStatus.Ok };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param email
 * @returns Client using mail
 */
export const getClientByEmail = async (
  email: string,
): Promise<{
  status: dbResStatus;
  client?: {
    username?: unknown;
    email?: unknown;
    firstname?: unknown;
    lastname?: unknown;
    mobile?: unknown;
    id?: unknown;
    address?: unknown;
    password?: unknown;
  }[];
}> => {
  const response = await chain("query")(
    {
      client: [
        {
          where: {
            email: { _eq: email },
          },
          limit: 1,
        },
        {
          email: true,
          username: true,
          firstname: true,
          lastname: true,
          mobile: true,
          password: true,
          id: true,
          address: {
            bitcoin: true,
            eth: true,
            sol: true,
            usdc: true,
            id: true,
          },
        },
      ],
    },
    { operationName: "getClientByEmail" },
  );
  if (response) {
    return {
      ...response,
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param username
 * @param email
 * @returns
 */
export const conflictClient = async (
  username: string,
  email: string,
): Promise<{
  status: dbResStatus;
  client?: getClientId[];
}> => {
  const response = await chain("query")(
    {
      client: [
        {
          where: {
            _or: [{ username: { _eq: username } }, { email: { _eq: email } }],
          },
          limit: 1,
        },
        {
          id: true,
        },
      ],
    },
    { operationName: "conflictClient" },
  );
  if (response) {
    return {
      ...response,
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param username
 * @param email
 * @returns
 */
export const checkClient = async (
  username: string,
  email: string,
): Promise<{
  client?: {
    username?: unknown;
    email?: unknown;
    firstname?: unknown;
    lastname?: unknown;
    mobile?: unknown;
    id?: unknown;
    address?: unknown;
    password?: unknown;
  }[];
  status: dbResStatus;
}> => {
  const response = await chain("query")(
    {
      client: [
        {
          where: {
            username: { _eq: username },
            email: { _eq: email },
          },
          limit: 1,
        },
        {
          email: true,
          username: true,
          firstname: true,
          lastname: true,
          id: true,
          address: {
            bitcoin: true,
            eth: true,
            sol: true,
            usdc: true,
            id: true,
          },
          mobile: true,
          password: true,
        },
      ],
    },
    { operationName: "checkClient" },
  );
  if (response.client.length) {
    return {
      ...response,
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param username
 * @param email
 * @returns
 */
export const getClientMetaData = async (
  username: string,
): Promise<{
  client?: {
    username?: unknown;
    email?: unknown;
    firstname?: unknown;
    lastname?: unknown;
    mobile?: unknown;
    id?: unknown;
    address?: unknown;
  }[];
  status: dbResStatus;
}> => {
  const response = await chain("query")(
    {
      client: [
        {
          where: {
            username: { _like: username },
          },
          limit: 1,
        },
        {
          email: true,
          username: true,
          firstname: true,
          lastname: true,
          id: true,
          address: {
            bitcoin: true,
            eth: true,
            sol: true,
            usdc: true,
            id: true,
          },
          mobile: true,
        },
      ],
    },
    { operationName: "getClient" },
  );
  if (response.client[0].id) {
    return {
      ...response,
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param username
 * @param email
 * @returns
 */
export const updateMetadata = async (
  id: string,
  firstname: string,
  lastname: string,
): Promise<{
  status: dbResStatus;
}> => {
  const response = await chain("mutation")(
    {
      update_client: [
        {
          where: {
            id: { _eq: id },
          },
          _set: {
            firstname,
            lastname,
          },
        },
        {
          returning: {
            firstname: true,
            lastname: true,
          },
        },
      ],
    },
    { operationName: "updateMetadata" },
  );
  if (response.update_client) {
    return {
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param username
 * @param email
 * @returns
 */
export const getClientById = async (
  id: string,
): Promise<{
  client?: {
    username?: unknown;
    email?: unknown;
    firstname?: unknown;
    lastname?: unknown;
    mobile?: unknown;
    id?: unknown;
    trips?: unknown;
  }[];
  status: dbResStatus;
}> => {
  const response = await chain("query")(
    {
      client: [
        {
          where: {
            id: { _eq: id },
          },
          limit: 1,
        },
        {
          id: true,
          email: true,
          username: true,
          lastname: true,
          firstname: true,
          mobile: true,
          address: {
            bitcoin: true,
            eth: true,
            sol: true,
            usdc: true,
            id: true,
          },
        },
      ],
    },
    { operationName: "getClientById" },
  );
  if (response.client[0].id) {
    return {
      ...response,
      status: dbResStatus.Ok,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param username
 * @param email
 * @returns
 */
export const deleteClient = async (
  id: string,
): Promise<{
  status: dbResStatus;
}> => {
  const response = await chain("mutation")(
    {
      delete_client: [
        {
          where: {
            id: { _eq: id },
          },
        },
        {
          returning: {
            username: true,
          },
        },
      ],
    },
    { operationName: "deleteClient" },
  );

  if (response.delete_client?.returning[0].username) {
    return {
      status: dbResStatus.Ok,
    };
  }

  return {
    status: dbResStatus.Error,
  };
};

// And continue
