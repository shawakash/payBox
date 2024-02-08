import { Chain } from "@paybox/zeus";
import {
  HASURA_ADMIN_SERCRET,
  HASURA_URL,
  InsertTxnType,
  JWT,
  TxnQuerySignType,
  TxnType,
  TxnsQeuryType,
  dbResStatus,
} from "@paybox/common";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
    "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
  },
});

/**
 *
 * @param clientId
 * @param blockTime
 * @param amount
 * @param fee
 * @param from
 * @param to
 * @param postBalances
 * @param preBalances
 * @param recentBlockhash
 * @param signature
 * @param network
 * @param slot
 * @returns { status, id? }
 */
export const insertTxn = async ({
  clientId,
  blockTime,
  amount,
  fee,
  from,
  to,
  postBalances,
  preBalances,
  recentBlockhash,
  signature,
  network,
  slot,
  chainId,
  cluster,
}: InsertTxnType): Promise<{
  status: dbResStatus;
  id?: unknown;
}> => {
  const response = await chain("mutation")(
    {
      insert_transactions_one: [
        {
          object: {
            clientId,
            signature,
            network,
            slot,
            amount,
            blockTime,
            fee,
            from,
            to,
            preBalances,
            postBalances,
            recentBlockhash,
            chainId,
            cluster,
            status: "confirmed",
          },
        },
        {
          id: true,
        },
      ],
    },
    { operationName: "insertTxn" },
  );
  if (response.insert_transactions_one?.id) {
    return {
      status: dbResStatus.Ok,
      ...response.insert_transactions_one,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param param0
 * @returns
 */
export const getTxns = async ({
  networks,
  count,
  clientId,
}: TxnsQeuryType): Promise<{
  status: dbResStatus;
  txns?: unknown[];
}> => {
  const networkArray = Array.isArray(networks) ? networks : [networks]; // Ensure networks is an array
  const response = await chain("query")(
    {
      transactions: [
        {
          where: {
            clientId: { _eq: clientId },
            _or: networkArray.map((network) => ({
              network: { _eq: network },
            })),
          },
          limit: count,
        },
        {
          id: true,
          //@ts-ignore
          signature: true,
          amount: true,
          blockTime: true,
          clientId: true,
          fee: true,
          date: true,
          from: true,
          network: true,
          //@ts-ignore
          postBalances: true,
          //@ts-ignore
          preBalances: true,
          recentBlockhash: true,
          slot: true,
          to: true,
        },
      ],
    },
    { operationName: "getTxns" },
  );
  if (response.transactions[0]) {
    const txns = response.transactions as unknown as TxnType[];
    return {
      status: dbResStatus.Ok,
      txns,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param param0
 * @returns
 */
export const getTxnByHash = async ({
  network,
  sign,
  clientId,
}: TxnQuerySignType): Promise<{
  status: dbResStatus;
  txn?: TxnType;
  id?: unknown;
}> => {
  const response = await chain("query")(
    {
      transactions: [
        {
          where: {
            signature: { _contains: sign },
            clientId: { _eq: clientId },
            network: { _eq: network },
          },
        },
        {
          id: true,
          //@ts-ignore
          signature: true,
          amount: true,
          blockTime: true,
          clientId: true,
          fee: true,
          date: true,
          from: true,
          network: true,
          //@ts-ignore
          postBalances: true,
          //@ts-ignore
          preBalances: true,
          recentBlockhash: true,
          slot: true,
          to: true,
        },
      ],
    },
    { operationName: "getTxnByHash" },
  );
  if (response.transactions[0]) {
    const txn = response.transactions[0] as unknown as TxnType;
    return {
      status: dbResStatus.Ok,
      id: response.transactions[0].id,
      txn,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};

/**
 *
 * @param param0
 * @returns
 */
export const getAllTxn = async ({
  clientId,
}: {
  clientId: string;
}): Promise<{
  status: dbResStatus;
  txns?: unknown[];
}> => {
  const response = await chain("query")(
    {
      transactions: [
        {
          where: {
            clientId: { _eq: clientId },
          },
        },
        {
          id: true,
          //@ts-ignore
          signature: true,
          amount: true,
          blockTime: true,
          clientId: true,
          fee: true,
          date: true,
          from: true,
          network: true,
          //@ts-ignore
          postBalances: true,
          //@ts-ignore
          preBalances: true,
          recentBlockhash: true,
          slot: true,
          to: true,
        },
      ],
    },
    { operationName: "getTxns" },
  );
  if (response.transactions[0]) {
    const txns = response.transactions as unknown as TxnType[];
    return {
      status: dbResStatus.Ok,
      txns,
    };
  }
  return {
    status: dbResStatus.Error,
  };
};
