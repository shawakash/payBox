import { Chain, order_by } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus } from "../types/client";
import {
  AccountType,
  HASURA_ADMIN_SERCRET,
  Network,
  WalletKeys,
  WalletType,
} from "@paybox/common";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
    "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
  },
});

/**
 *
 * @param walletId
 * @param clientId
 * @returns
 */
export const getSecretPhase = async (
  walletId: string,
  clientId: string,
): Promise<{
  status: dbResStatus;
  secret?: string;
}> => {
  const response = await chain("query")({
    wallet: [
      {
        limit: 1,
        where: {
          id: { _eq: walletId },
          clientId: { _eq: clientId },
        },
      },
      {
        secretPhase: true,
      },
    ],
  });
  if (response.wallet[0].secretPhase) {
    return {
      status: dbResStatus.Ok,
      secret: response.wallet[0].secretPhase as string,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param key
 * @returns
 */
export const getAccountsFromWalletId = async (
  walletId: string,
): Promise<{
  status: dbResStatus;
  accounts?: AccountType[];
}> => {
  const response = await chain("query")(
    {
      account: [
        {
          where: {
            walletId: { _eq: walletId },
          },
        },
        {
          id: true,
          eth: {
            publicKey: true,
            goerliEth: true,
            kovanEth: true,
            mainnetEth: true,
            rinkebyEth: true,
            ropstenEth: true,
            sepoliaEth: true,
          },
          sol: {
            publicKey: true,
            devnetSol: true,
            mainnetSol: true,
            testnetSol: true,
          },
          walletId: true,
          bitcoin: {
            publicKey: true,
            mainnetBtc: true,
            regtestBtc: true,
            textnetBtc: true,
          },
          name: true,
          clientId: true,
          createdAt: true,
          updatedAt: true
        },
      ],
    },
    { operationName: "getAccounts" },
  );
  if (response.account[0].id) {
    return {
      status: dbResStatus.Ok,
      accounts: response.account as AccountType[],
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param walletId
 * @param clientId
 * @returns
 */
export const delWallet = async (
  walletId: string,
  clientId: string,
): Promise<{
  status: dbResStatus;
  accounts?: {id: string}[]
}> => {
  const deleteEth = await chain("mutation")({
    delete_eth: [{
      where: {
        account: {
          walletId: { _eq: walletId },
        }
      }
    }, {
      returning: {
        id: true
      }
    }],
  }, {operationName: "deleteEth"});

  const deleteSol = await chain("mutation")({
    delete_sol: [{
      where: {
        account: {
          walletId: { _eq: walletId },
        }
      }
    }, {
      returning: {
        id: true
      }
    }]
  }, {operationName: "deleteSol"});

  const deleteAccount = await chain("mutation")({
    delete_account: [{
      where: {
        walletId: { _eq: walletId },
      }
    }, {
      returning: {
        id: true
      }
    }]
  }, {operationName: "deleteAccount"});

  const delete_wallet = await chain("mutation")({
    delete_wallet: [
      {
        where: {
          id: { _eq: walletId },
          clientId: { _eq: clientId },
        },
      },
      {
        returning: {
          id: true
        },
      },
    ],
  }, {operationName: "deleteWallet"});

  if (Array.isArray(deleteAccount.delete_account?.returning) && delete_wallet.delete_wallet?.returning[0].id) {
    return {
      status: dbResStatus.Ok,
      accounts: deleteAccount.delete_account?.returning as {id: string}[] || [],
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

export const createWallet = async (
  clientId: string,
  secretPhase: string,
  name: string,
  solKeys: WalletKeys,
  ethKeys: WalletKeys,
): Promise<{
  status: dbResStatus;
  id?: string;
}> => {
  const response = await chain("mutation")({
    insert_wallet_one: [
      {
        object: {
          clientId,
          secretPhase,
          accounts: {
            data: [
              {
                name,
                sol: {
                  data: solKeys,
                },
                eth: {
                  data: ethKeys,
                },
                clientId,
              },
            ],
          },
        },
      },
      {
        id: true,
      },
    ],
  });
  if (response.insert_wallet_one?.id) {
    return {
      status: dbResStatus.Ok,
      id: response.insert_wallet_one.id as string,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param clientId
 * @param seed
 * @param network
 * @param name
 * @param keys
 * @returns
 */
export const importFromPrivate = async (
  clientId: string,
  seed: string,
  network: Network,
  name: string,
  keys: WalletKeys,
): Promise<{
  status: dbResStatus;
  wallet?: WalletType;
}> => {
  const response = await chain("mutation")({
    insert_wallet_one: [
      {
        object: {
          clientId,
          secretPhase: seed,
          accounts: {
            data: [
              {
                name,
                [network]: {
                  data: keys,
                },
                clientId,
              },
            ],
          },
        },
      },
      {
        id: true,
        accounts: [
          {
            limit: 1,
          },
          {
            id: true,
            eth: {
              publicKey: true,
              goerliEth: true,
              kovanEth: true,
              mainnetEth: true,
              rinkebyEth: true,
              ropstenEth: true,
              sepoliaEth: true,
            },
            sol: {
              publicKey: true,
              devnetSol: true,
              mainnetSol: true,
              testnetSol: true,
            },
            walletId: true,
            bitcoin: {
              publicKey: true,
              mainnetBtc: true,
              regtestBtc: true,
              textnetBtc: true,
            },
            createdAt: true,
            updatedAt: true
          },
        ],
      },
    ],
  });
  if (response.insert_wallet_one?.id) {
    return {
      status: dbResStatus.Ok,
      wallet: {
        clientId,
        id: response.insert_wallet_one.id as string,
        accounts: response.insert_wallet_one.accounts as AccountType[],
      },
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param clientId
 * @param name
 * @param secretPhase
 * @param keys
 * @returns
 */
export const addAccountPhrase = async (
  clientId: string,
  name: string,
  secretPhase: string,
  keys: (WalletKeys & { network: Network })[],
): Promise<{
  status: dbResStatus;
  wallet?: WalletType;
}> => {
  const accountsData = keys.reduce(
    (acc, { network, privateKey, publicKey }) => {
      if (network === Network.Sol || network === Network.Eth) {
        acc[network] = {
          data: { privateKey, publicKey },
        };
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const response = await chain("mutation")({
    insert_wallet_one: [
      {
        object: {
          clientId,
          secretPhase,
          accounts: {
            data: [
              {
                name,
                ...accountsData,
                clientId,
              },
            ],
          },
        },
      },
      {
        id: true,
        accounts: [
          {
            limit: 1,
          },
          {
            id: true,
            eth: {
              publicKey: true,
              goerliEth: true,
              kovanEth: true,
              mainnetEth: true,
              rinkebyEth: true,
              ropstenEth: true,
              sepoliaEth: true,
            },
            sol: {
              publicKey: true,
              devnetSol: true,
              mainnetSol: true,
              testnetSol: true,
            },
            walletId: true,
            clientId: true,
            bitcoin: {
              publicKey: true,
              mainnetBtc: true,
              regtestBtc: true,
              textnetBtc: true,
            },
            createdAt: true,
            updatedAt: true
          },
        ],
      },
    ],
  });
  if (response.insert_wallet_one?.id) {
    return {
      status: dbResStatus.Ok,
      wallet: {
        clientId,
        id: response.insert_wallet_one.id as string,
        accounts: response.insert_wallet_one.accounts as AccountType[],
      },
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 * 
 * @param id 
 * @returns 
 */
export const getWallets = async (
  id: string
): Promise<{
  status: dbResStatus,
  wallets?: WalletType[]
}> => {
  const response = await chain("query")({
    wallet: [{
      where: {
        clientId: { _eq: id },
      },
      order_by: [{
        createdAt: order_by["asc"]
      }]
    }, {
      id: true,
      clientId: true,
    }]
  }, { operationName: "getWallets" });
  if (response.wallet[0].id) {
    return {
      status: dbResStatus.Ok,
      wallets: response.wallet as WalletType[]
    }
  }
  return {
    status: dbResStatus.Error,
  }
}

/**
 * 
 * @param clientId 
 * @returns 
 */
export const getWalletForAccountCreate = async (
  clientId: string
): Promise<{
  status: dbResStatus,
  secretPhase?: string,
  id?: string
}> => {
  const response = await chain("query")({
    wallet: [{
      where: {
        clientId: { _eq: clientId }
      },
      order_by: [{
        createdAt: order_by["asc"]
      }],
      limit: 1
    }, {
      secretPhase: true,
      id: true,
    }]
  }, { operationName: "getWalletForAccountCreate" });
  if (response.wallet[0].id) {
    return {
      status: dbResStatus.Ok,
      id: response.wallet[0].id as string,
      secretPhase: response.wallet[0].secretPhase as string
    }
  }
  return {
    status: dbResStatus.Error
  }
}